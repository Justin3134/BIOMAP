import express from 'express';
import { notesDB } from '../storage/db.js';
import { refineNote } from '../services/openai.js';

const router = express.Router();

/**
 * POST /api/notes
 * Step 4: Save a note
 */
router.post('/', (req, res) => {
  try {
    const { projectId, content, linkedSources } = req.body;

    if (!projectId || !content) {
      return res.status(400).json({ error: 'projectId and content are required' });
    }

    const noteId = `note_${Date.now()}`;
    const note = {
      id: noteId,
      projectId,
      content,
      linkedSources: linkedSources || [], // paper IDs, protocol versions, decisions
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    notesDB.set(noteId, note);

    res.json({
      success: true,
      note
    });
  } catch (error) {
    console.error('Error saving note:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/notes/project/:projectId
 * Get all notes for a project
 */
router.get('/project/:projectId', (req, res) => {
  const allNotes = notesDB.getAll();
  const projectNotes = Object.values(allNotes)
    .filter(note => note.projectId === req.params.projectId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(projectNotes);
});

/**
 * GET /api/notes/:id
 * Get single note
 */
router.get('/:id', (req, res) => {
  const note = notesDB.get(req.params.id);
  
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  res.json(note);
});

/**
 * POST /api/notes/:id/refine
 * Step 4: Refine note with AI
 */
router.post('/:id/refine', async (req, res) => {
  try {
    const note = notesDB.get(req.params.id);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const { action } = req.body; // 'clarify', 'summarize', 'next_steps'

    console.log(`🔄 Refining note with action: ${action || 'clarify'}`);

    const refinedContent = await refineNote(note.content, note.linkedSources, action);

    res.json({
      success: true,
      originalContent: note.content,
      refinedContent
    });

  } catch (error) {
    console.error('Error refining note:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/notes/:id
 * Update note
 */
router.put('/:id', (req, res) => {
  const note = notesDB.get(req.params.id);
  
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const { content, linkedSources } = req.body;
  
  if (content) note.content = content;
  if (linkedSources) note.linkedSources = linkedSources;
  
  note.updatedAt = new Date().toISOString();
  notesDB.set(req.params.id, note);

  res.json(note);
});

/**
 * DELETE /api/notes/:id
 * Delete note
 */
router.delete('/:id', (req, res) => {
  const note = notesDB.get(req.params.id);
  
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  notesDB.delete(req.params.id);
  
  res.json({ success: true, message: 'Note deleted' });
});

export default router;

