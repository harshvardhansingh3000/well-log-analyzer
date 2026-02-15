import { getWellData } from '../services/dbService.js';
import { analyzeWellData } from '../services/aiService.js';

/**
 * Analyze well data with AI
 */
export async function interpretData(req, res) {
  try {
    const { id } = req.params;
    const { startDepth, endDepth, curves } = req.body;

    // Validate parameters
    if (!startDepth || !endDepth || !curves || curves.length === 0) {
      return res.status(400).json({ 
        error: 'startDepth, endDepth, and curves are required' 
      });
    }

    // Get data from database
    const data = await getWellData(id, parseFloat(startDepth), parseFloat(endDepth));

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No data found for this range' });
    }

    // Analyze with AI
    const interpretation = await analyzeWellData(
      data, 
      curves, 
      parseFloat(startDepth), 
      parseFloat(endDepth)
    );

    res.json({ 
      interpretation,
      depthRange: { start: startDepth, end: endDepth },
      curves,
      dataPoints: data.length
    });

  } catch (error) {
    console.error('Error interpreting data:', error);
    res.status(500).json({ error: 'Failed to interpret data' });
  }
}
