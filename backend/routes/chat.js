import express from 'express';
import { projectsDB, researchDB, notesDB, chatDB } from '../storage/db.js';
import { contextAwareChat } from '../services/openai.js';

const router = express.Router();

/**
 * POST /api/chat
 * Step 5: THE MOST IMPORTANT PART
 * Context-aware chat that's grounded in the user's research
 */
router.post('/', async (req, res) => {
  try {
    const { projectId, message, selectedPaperIds } = req.body;

    if (!projectId || !message) {
      return res.status(400).json({ error: 'projectId and message are required' });
    }

    // Get project
    const project = projectsDB.get(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get research map
    const researchMapId = `research_${projectId}`;
    const researchMap = researchDB.get(researchMapId);

    // Get selected papers (or all if none selected)
    let selectedPapers = [];
    if (researchMap) {
      const allPapers = researchMap.clusters.flatMap(c => c.papers);
      
      if (selectedPaperIds && selectedPaperIds.length > 0) {
        selectedPapers = allPapers.filter(p => selectedPaperIds.includes(p.paperId));
      } else {
        // Use top 5 most relevant papers
        selectedPapers = allPapers
          .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
          .slice(0, 5);
      }
    }

    // Get linked notes
    const allNotes = notesDB.getAll();
    const linkedNotes = Object.values(allNotes)
      .filter(note => note.projectId === projectId)
      .slice(0, 5); // Limit to recent 5 notes

    // Build Context Packet
    const contextPacket = {
      project_summary: project.summary,
      constraints: project.constraints,
      selected_papers: selectedPapers,
      evidence_cards: [], // Could be populated if we stored evidence
      linked_notes: linkedNotes
    };

    console.log('💬 Sending context-aware chat request...');
    console.log(`📦 Context: ${selectedPapers.length} papers, ${linkedNotes.length} notes`);

    // Get AI response with grounded context
    const aiResponse = await contextAwareChat(message, contextPacket);

    // Store chat history
    const chatHistoryId = `chat_${projectId}`;
    let chatHistory = chatDB.get(chatHistoryId) || { projectId, messages: [] };
    
    chatHistory.messages.push(
      {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      },
      {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        contextUsed: {
          papersCount: selectedPapers.length,
          notesCount: linkedNotes.length
        }
      }
    );

    chatDB.set(chatHistoryId, chatHistory);

    res.json({
      success: true,
      response: aiResponse,
      contextUsed: {
        papers: selectedPapers.length,
        notes: linkedNotes.length
      }
    });

  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/chat/history/:projectId
 * Get chat history for a project
 */
router.get('/history/:projectId', (req, res) => {
  const chatHistoryId = `chat_${req.params.projectId}`;
  const chatHistory = chatDB.get(chatHistoryId);

  if (!chatHistory) {
    return res.json({ projectId: req.params.projectId, messages: [] });
  }

  res.json(chatHistory);
});

/**
 * DELETE /api/chat/history/:projectId
 * Clear chat history
 */
router.delete('/history/:projectId', (req, res) => {
  const chatHistoryId = `chat_${req.params.projectId}`;
  chatDB.delete(chatHistoryId);
  
  res.json({ success: true, message: 'Chat history cleared' });
});

export default router;

