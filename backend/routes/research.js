import express from 'express';
import OpenAI from 'openai';
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
// AI generation disabled - only use real papers from Semantic Scholar
// import {
//     generateResearchPapers,
//     clusterByApproach
// } from '../services/openaiResearch.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const router = express.Router();

// Helper function to generate abstracts for papers missing them
async function fillMissingAbstracts(papers) {
    const papersNeedingAbstracts = papers.filter(p => !p.abstract || p.abstract.trim() === '');

    if (papersNeedingAbstracts.length === 0) {
        return papers;
    }

    console.log(`📝 Generating abstracts for ${papersNeedingAbstracts.length} papers using AI...`);

    // Generate abstracts in batches to avoid rate limits
    for (const paper of papersNeedingAbstracts) {
        try {
            const prompt = `Based on this research paper title and metadata, write a concise 2-3 sentence abstract that describes what the paper likely covers:

Title: ${paper.title}
Year: ${paper.year}
Authors: ${paper.authors?.slice(0, 3).map(a => a.name).join(', ') || 'Unknown'}
Venue: ${paper.venue || 'Unknown'}

Write ONLY the abstract, nothing else.`;

            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                temperature: 0.7,
                max_tokens: 150
            });

            paper.abstract = response.choices[0].message.content.trim();
            console.log(`  ✅ Generated abstract for: ${paper.title.substring(0, 50)}...`);
        } catch (error) {
            console.error(`  ❌ Failed to generate abstract for ${paper.title}:`, error.message);
            // Fallback to title-based summary
            paper.abstract = `This research paper explores ${paper.title.toLowerCase()}. Published in ${paper.year}, this work contributes to understanding in this field.`;
        }
    }

    return papers;
}

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

        // ONLY use Semantic Scholar - NO AI generation fallback
        try {
            const searchQuery = project.summary;
            console.log(`🔍 Searching Semantic Scholar for: "${searchQuery}"`);
            papers = await searchPapers(searchQuery, 20);

            // If Semantic Scholar fails, try a simpler query
            if (papers.length === 0) {
                console.log('⚠️ No papers found, trying simpler search...');
                const simpleQuery = project.description.split('.')[0];
                console.log(`🔍 Trying simpler query: "${simpleQuery}"`);
                papers = await searchPapers(simpleQuery, 20);
            }
            
            // If still no results, try with just keywords
            if (papers.length === 0) {
                const keywords = project.summary.split(' ').slice(0, 5).join(' ');
                console.log(`🔍 Trying with keywords: "${keywords}"`);
                papers = await searchPapers(keywords, 20);
            }
        } catch (error) {
            console.error('⚠️ Semantic Scholar error:', error.message);
        }

        if (papers.length === 0) {
            console.log('❌ No papers found from Semantic Scholar');
            const researchMapId = `research_${req.params.projectId}`;
            researchDB.set(researchMapId, {
                projectId: req.params.projectId,
                clusters: [],
                totalPapers: 0,
                createdAt: new Date().toISOString(),
                error: 'No papers found from Semantic Scholar. Try a different research topic or broader keywords.'
            });

            return res.json({
                success: false,
                message: 'No papers found from Semantic Scholar. Try a different research topic or broader keywords.',
                clusters: [],
                totalPapers: 0
            });
        }

        console.log(`✅ Found ${papers.length} real papers from Semantic Scholar`);

        // Fill missing abstracts for Semantic Scholar papers
        papers = await fillMissingAbstracts(papers);

        let labeledClusters;

        // Use embedding-based clustering for real Semantic Scholar papers
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