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

                    return {
                        branch_id: cluster.cluster_id,
                        label,
                        papers: cluster.papers.map(p => ({
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
                        })),
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

export default router;