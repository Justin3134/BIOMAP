import express from 'express';
import {
    projectsDB,
    researchDB
} from '../storage/db.js';
import {
    generateEmbedding,
    labelCluster,
    extractEvidence
} from '../services/openai.js';
import {
    kmeansClustering
} from '../services/clustering.js';
import {
    searchPapers
} from '../services/semanticScholar.js';
import {
    generateResearchPapers,
    clusterByApproach
} from '../services/openaiResearch.js';

const router = express.Router();

/**
 * POST /api/research/map/:projectId
 * Step 2: Build Research Landscape
 * This is the CORE feature
 */
router.post('/map/:projectId', async (req, res) => {
    try {
        const project = projectsDB.get(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                error: 'Project not found'
            });
        }

        console.log('🔍 Step A: Searching for research papers...');

        let papers = [];
        let useAIGenerated = false;

        // Try Semantic Scholar first
        try {
            const searchQuery = project.summary;
            papers = await searchPapers(searchQuery, 20);

            // If Semantic Scholar fails, try a simpler query
            if (papers.length === 0) {
                console.log('⚠️ No papers found, trying simpler search...');
                const simpleQuery = project.description.split('.')[0];
                papers = await searchPapers(simpleQuery, 20);
            }
        } catch (error) {
            console.log('⚠️ Semantic Scholar failed:', error.message);
        }

        // Fallback to AI-generated papers if Semantic Scholar fails
        if (papers.length === 0) {
            console.log('🤖 Falling back to AI-generated research papers...');
            papers = await generateResearchPapers(project.summary, project.description, 15);
            useAIGenerated = true;
        }

        if (papers.length === 0) {
            console.log('❌ Could not generate any papers');
            const researchMapId = `research_${req.params.projectId}`;
            researchDB.set(researchMapId, {
                projectId: req.params.projectId,
                clusters: [],
                totalPapers: 0,
                createdAt: new Date().toISOString(),
                error: 'Failed to generate research papers'
            });

            return res.json({
                success: false,
                message: 'Failed to generate research papers',
                clusters: [],
                totalPapers: 0
            });
        }

        console.log(`✅ Found ${papers.length} papers (${useAIGenerated ? 'AI-generated' : 'from Semantic Scholar'})`);

        let labeledClusters;

        if (useAIGenerated) {
            // For AI-generated papers, use approach-based clustering (faster, no embeddings needed)
            console.log('🗂️ Clustering AI papers by approach...');
            const clusters = clusterByApproach(papers, 5);

            labeledClusters = clusters.map(cluster => ({
                branch_id: cluster.cluster_id,
                label: cluster.label,
                papers: cluster.papers.map(p => ({
                    paperId: p.paperId,
                    title: p.title,
                    year: p.year,
                    authors: p.authors?.slice(0, 3).map(a => a.name).join(', '),
                    abstract: p.abstract,
                    citationCount: p.citationCount,
                    similarity: p.similarity,
                    venue: p.venue,
                    url: null, // AI-generated papers don't have real URLs
                    isAIGenerated: true
                })),
                avgSimilarity: cluster.avgSimilarity
            }));
        } else {
            // For real papers from Semantic Scholar, use embedding-based clustering
            console.log('🧮 Step B: Generating embeddings...');
            const projectEmbedding = await generateEmbedding(project.summary);

            const papersWithEmbeddings = await Promise.all(
                papers.map(async (paper) => {
                    const text = paper.abstract || paper.title || '';
                    const embedding = await generateEmbedding(text.substring(0, 1000));
                    return {
                        ...paper,
                        embedding
                    };
                })
            );

            console.log('🎯 Step C: Clustering papers...');
            const numClusters = Math.min(5, Math.max(3, Math.ceil(papers.length / 4)));
            const clusters = kmeansClustering(papersWithEmbeddings, projectEmbedding, numClusters);

            console.log('🏷️ Step D: Labeling branches with AI...');
            labeledClusters = await Promise.all(
                clusters.map(async (cluster) => {
                    const abstracts = cluster.papers
                        .slice(0, 3)
                        .map(p => p.abstract || p.title)
                        .filter(Boolean);

                    const label = await labelCluster(abstracts);

                    const mappedPapers = cluster.papers.map(p => ({
                        paperId: p.paperId,
                        title: p.title,
                        year: p.year,
                        authors: p.authors?.slice(0, 3).map(a => a.name).join(', '),
                        abstract: p.abstract,
                        citationCount: p.citationCount,
                        similarity: p.similarity,
                        venue: p.venue,
                        url: p.paperId ? `https://www.semanticscholar.org/paper/${p.paperId}` : null,
                        isAIGenerated: false
                    }));
                    
                    // Debug: Check if abstracts are present
                    const papersWithAbstract = mappedPapers.filter(p => p.abstract && p.abstract.length > 0).length;
                    console.log(`📊 Cluster "${label}": ${mappedPapers.length} papers, ${papersWithAbstract} with abstracts`);
                    
                    return {
                        branch_id: cluster.cluster_id,
                        label,
                        papers: mappedPapers,
                        avgSimilarity: cluster.avgSimilarity
                    };
                })
            );
        }

        // Store research map
        const researchMapId = `research_${req.params.projectId}`;
        researchDB.set(researchMapId, {
            projectId: req.params.projectId,
            clusters: labeledClusters,
            totalPapers: papers.length,
            createdAt: new Date().toISOString()
        });

        console.log('✅ Research map built successfully!');

        res.json({
            success: true,
            clusters: labeledClusters,
            totalPapers: papers.length
        });

    } catch (error) {
        console.error('Error building research map:', error);

        // Save error state to avoid 404
        const researchMapId = `research_${req.params.projectId}`;
        researchDB.set(researchMapId, {
            projectId: req.params.projectId,
            clusters: [],
            totalPapers: 0,
            createdAt: new Date().toISOString(),
            error: error.message
        });

        res.status(500).json({
            error: error.message
        });
    }
});

/**
 * GET /api/research/map/:projectId
 * Get stored research map
 */
router.get('/map/:projectId', (req, res) => {
    const researchMapId = `research_${req.params.projectId}`;
    const researchMap = researchDB.get(researchMapId);

    if (!researchMap) {
        return res.status(404).json({
            error: 'Research map not found. Build it first.'
        });
    }

    res.json(researchMap);
});

/**
 * POST /api/research/evidence
 * Step 3: Generate Evidence Card when user clicks a node
 */
router.post('/evidence', async (req, res) => {
    try {
        const {
            paperId,
            title,
            abstract
        } = req.body;

        if (!abstract) {
            return res.status(400).json({
                error: 'Abstract is required'
            });
        }

        console.log('📋 Extracting evidence from paper...');

        // Extract structured evidence using OpenAI
        const evidence = await extractEvidence(abstract, title);

        res.json({
            success: true,
            paperId,
            title,
            evidence
        });

    } catch (error) {
        console.error('Error extracting evidence:', error);
        res.status(500).json({
            error: error.message
        });
    }
});

/**
 * POST /api/research/similar
 * Find similar papers using OpenAI
 */
router.post('/similar', async (req, res) => {
    try {
        const {
            paperId,
            title,
            abstract,
            count = 5
        } = req.body;

        if (!title || !abstract) {
            return res.status(400).json({
                error: 'title and abstract are required'
            });
        }

        console.log(`🔍 Finding similar papers to: ${title}`);

        // Use OpenAI to generate similar paper suggestions
        const {
            default: OpenAI
        } = await import('openai');
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const prompt = `Based on this research paper, suggest ${count} similar real research papers in the same field:

Title: ${title}
Abstract: ${abstract.substring(0, 500)}

Generate ${count} realistic similar papers with:
- Different but related titles
- Similar methodology or research area
- Realistic author names
- Years between 2018-2024
- Brief abstracts (100 words)

Return ONLY valid JSON array:
[{"title":"...","abstract":"...","year":2023,"authors":"Name1, Name2","approach":"method"}]`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                    role: 'system',
                    content: 'You are a research database. Generate realistic similar papers. Return valid JSON only.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.8,
            max_tokens: 2000,
            response_format: {
                type: "json_object"
            }
        });

        const content = response.choices[0].message.content;
        const parsed = JSON.parse(content);
        const papers = parsed.papers || parsed.results || parsed;

        if (!Array.isArray(papers)) {
            console.error('❌ OpenAI did not return an array');
            return res.json({
                similarPapers: []
            });
        }

        // Transform to consistent format
        const similarPapers = papers.map((p, idx) => ({
            paperId: `similar_${Date.now()}_${idx}`,
            title: p.title,
            abstract: p.abstract,
            year: p.year || 2023,
            authors: typeof p.authors === 'string' ? p.authors : p.authors?.join(', ') || 'Unknown',
            url: null,
            isAIGenerated: true
        }));

        console.log(`✅ Generated ${similarPapers.length} similar papers`);

        res.json({
            success: true,
            similarPapers,
            basedOn: title
        });

    } catch (error) {
        console.error('Error finding similar papers:', error);
        res.status(500).json({
            error: error.message,
            similarPapers: []
        });
    }
});

export default router;