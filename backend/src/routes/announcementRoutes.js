import express from 'express';
import {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

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

