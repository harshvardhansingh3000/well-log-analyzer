import express from 'express';
import { getWells, getWell, getCurves, getData } from '../controllers/wellController.js';
import { interpretData } from '../controllers/aiController.js';

const router = express.Router();

// GET /api/wells - Get all wells
router.get('/', getWells);

// GET /api/wells/:id - Get well by ID
router.get('/:id', getWell);

// GET /api/wells/:id/curves - Get available curves
router.get('/:id/curves', getCurves);

// GET /api/wells/:id/data - Get well data
router.get('/:id/data', getData);

// POST /api/wells/:id/interpret - AI interpretation
router.post('/:id/interpret', interpretData);

export default router;
