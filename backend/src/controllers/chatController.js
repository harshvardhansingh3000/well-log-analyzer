import { chatWithAI } from '../services/aiService.js';
import { getWellById, getWellData } from '../services/dbService.js';

/**
 * Handle chat messages about well data
 */
export async function handleChat(req, res) {
  try {
    const { wellId, message, conversationHistory = [] } = req.body;

    if (!wellId || !message) {
      return res.status(400).json({ error: 'Well ID and message are required' });
    }

    // Get well information
    const well = await getWellById(wellId);
    if (!well) {
      return res.status(404).json({ error: 'Well not found' });
    }

    // Get sample data for context
    const data = await getWellData(wellId, well.start_depth, well.start_depth + 50);

    // Get AI response
    const response = await chatWithAI(message, well, data, conversationHistory);

    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
}
