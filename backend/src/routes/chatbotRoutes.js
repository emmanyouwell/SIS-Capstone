import express from 'express';
import { getAnswer } from '../controllers/chatbotController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/v1/chatbot/answer
router.post('/answer', authMiddleware, getAnswer);

export default router;

