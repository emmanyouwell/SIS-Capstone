import express from 'express';
import {
  getMessages,
  getMessage,
  createMessage,
  updateMessage,
  deleteMessage,
  getUnreadMessageCount,
} from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.route('/').get(getMessages).post(createMessage);
router.get('/unread/count', getUnreadMessageCount);
router.route('/:id').get(getMessage).patch(updateMessage).delete(deleteMessage);

export default router;

