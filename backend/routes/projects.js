import express from 'express';
import { projectsDB } from '../storage/db.js';
import { generateProjectSummary } from '../services/openai.js';

const router = express.Router();

/**
 * POST /api/projects
 * Step 1: Create the "Project Brain"
 */
router.post('/', async (req, res) => {
  try {
    const { description, capabilities, constraints } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Project description is required' });
    }

    // Generate project context summary using OpenAI
    const summary = await generateProjectSummary(description, capabilities, constraints);

    // Create project object
    const projectId = `project_${Date.now()}`;
    const project = {
      id: projectId,
      description,
      capabilities: capabilities || {},
      constraints: constraints || {},
      summary, // The root anchor for everything
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to database
    projectsDB.set(projectId, project);

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/projects/:id
 * Get project details
 */
router.get('/:id', (req, res) => {
  const project = projectsDB.get(req.params.id);
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json(project);
});

/**
 * GET /api/projects
 * Get all projects
 */
router.get('/', (req, res) => {
  const projects = projectsDB.getAll();
  res.json(Object.values(projects));
});

/**
 * PUT /api/projects/:id
 * Update project
 */
router.put('/:id', async (req, res) => {
  try {
    const project = projectsDB.get(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { description, capabilities, constraints } = req.body;
    
    // Update fields
    if (description) project.description = description;
    if (capabilities) project.capabilities = capabilities;
    if (constraints) project.constraints = constraints;
    
    // Regenerate summary if description changed
    if (description) {
      project.summary = await generateProjectSummary(
        description,
        project.capabilities,
        project.constraints
      );
    }

    project.updatedAt = new Date().toISOString();
    projectsDB.set(req.params.id, project);

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

