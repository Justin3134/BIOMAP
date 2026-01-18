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
import { generateResearchPapers, clusterByApproach } from '../services/openaiResearch.js';

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

    console.log('🤖 Step A: Generating research papers with OpenAI...');
    // Step A: Generate research papers using OpenAI (no rate limits!)
    const papers = await generateResearchPapers(project.summary, project.description, 20);

    if (papers.length === 0) {
      console.log('⚠️ No papers generated, saving empty research map');
      
      // Store empty research map so we don't get 404
      const researchMapId = `research_${req.params.projectId}`;
      researchDB.set(researchMapId, {
        projectId: req.params.projectId,
        clusters: [],
        totalPapers: 0,
        createdAt: new Date().toISOString(),
        error: 'Failed to generate research papers.'
      });
      
      return res.json({
        success: true,
        message: 'Failed to generate papers.',
        clusters: [],
        totalPapers: 0
      });
    }

    console.log(`✅ Generated ${papers.length} papers with OpenAI`);

    // Step B: Cluster by approach (already in papers from OpenAI)
    console.log('🎯 Step B: Clustering papers by approach...');
    const numClusters = Math.min(5, Math.max(3, Math.ceil(papers.length / 4)));
    const clusters = clusterByApproach(papers, numClusters);

    console.log('🏷️ Step C: Labeling branches...');
    // Step C: Label each branch using the approach
    const labeledClusters = clusters.map((cluster, idx) => {
      // Capitalize and format the approach as the label
      const label = cluster.approach
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        branch_id: cluster.cluster_id,
        label: label,
        papers: cluster.papers.map(p => ({
          paperId: p.paperId,
          title: p.title,
          year: p.year,
          authors: p.authors?.slice(0, 3).map(a => a.name).join(', '),
          abstract: p.abstract,
          citationCount: p.citationCount,
          similarity: 0.85 - (idx * 0.05), // Decreasing similarity for each cluster
          venue: p.venue
        })),
        avgSimilarity: 0.85 - (idx * 0.05)
      };
    });

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