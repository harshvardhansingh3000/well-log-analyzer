import { getAllWells, getWellById, getWellData } from '../services/dbService.js';

/**
 * Get all wells
 */
export async function getWells(req, res) {
  try {
    const wells = await getAllWells();
    res.json(wells);
  } catch (error) {
    console.error('Error getting wells:', error);
    res.status(500).json({ error: 'Failed to fetch wells' });
  }
}

/**
 * Get well by ID
 */
export async function getWell(req, res) {
  try {
    const { id } = req.params;
    const well = await getWellById(id);
    
    if (!well) {
      return res.status(404).json({ error: 'Well not found' });
    }
    
    res.json(well);
  } catch (error) {
    console.error('Error getting well:', error);
    res.status(500).json({ error: 'Failed to fetch well' });
  }
}

/**
 * Get available curves for a well
 */
export async function getCurves(req, res) {
  try {
    const { id } = req.params;
    
    // Get first data row to extract curve names
    const data = await getWellData(id, 0, 999999);
    
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No data found for this well' });
    }
    
    // Extract curve names from the first row's data object
    const curves = Object.keys(data[0].data);
    
    res.json({ curves });
  } catch (error) {
    console.error('Error getting curves:', error);
    res.status(500).json({ error: 'Failed to fetch curves' });
  }
}

/**
 * Get well data for specified depth range and curves
 */
export async function getData(req, res) {
  try {
    const { id } = req.params;
    const { startDepth, endDepth, curves } = req.query;
    
    // Validate parameters
    if (!startDepth || !endDepth) {
      return res.status(400).json({ error: 'startDepth and endDepth are required' });
    }
    
    const data = await getWellData(id, parseFloat(startDepth), parseFloat(endDepth));
    
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No data found for this range' });
    }
    
    // If specific curves requested, filter them
    let result = data;
    if (curves) {
      const requestedCurves = curves.split(',');
      result = data.map(row => {
        const filteredData = {};
        requestedCurves.forEach(curve => {
          if (row.data[curve] !== undefined) {
            filteredData[curve] = row.data[curve];
          }
        });
        return {
          depth: row.depth,
          data: filteredData
        };
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error getting data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
