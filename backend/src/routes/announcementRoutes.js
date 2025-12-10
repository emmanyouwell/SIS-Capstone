import express from 'express';
import {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementStats,
} from '../controllers/announcementController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/stats', roleMiddleware('Admin'), getAnnouncementStats);

router
  .route('/')
  .get(getAnnouncements)
  .post(roleMiddleware('Admin', 'Teacher'), createAnnouncement);

router
  .route('/:id')
  .get(getAnnouncement)
  .patch(roleMiddleware('Admin', 'Teacher'), updateAnnouncement)
  .delete(roleMiddleware('Admin', 'Teacher'), deleteAnnouncement);

export default router;

