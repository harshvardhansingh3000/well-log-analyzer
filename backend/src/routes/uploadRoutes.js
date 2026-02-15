import express from 'express';
import multer from 'multer';
import { uploadFile } from '../controllers/uploadController.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// POST /api/upload - Upload LAS file
router.post('/', upload.single('file'), uploadFile);

export default router;
