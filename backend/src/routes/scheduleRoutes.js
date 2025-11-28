import express from 'express';
import {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from '../controllers/scheduleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.route('/').get(getSchedules).post(roleMiddleware('Admin'), createSchedule);
router
  .route('/:id')
  .get(getSchedule)
  .patch(roleMiddleware('Admin'), updateSchedule)
  .delete(roleMiddleware('Admin'), deleteSchedule);

export default router;

