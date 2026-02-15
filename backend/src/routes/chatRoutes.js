import express from 'express';
import { handleChat } from '../controllers/chatController.js';

const router = express.Router();

// POST /api/chat - Chat with AI about well data
router.post('/', handleChat);

export default router;
