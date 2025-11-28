import express from 'express';
import {
  getNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.route('/').get(getNotifications).post(roleMiddleware('Admin'), createNotification);
router.patch('/read-all', markAllAsRead);
router
  .route('/:id')
  .get(getNotification)
  .patch(updateNotification)
  .delete(deleteNotification);

export default router;

