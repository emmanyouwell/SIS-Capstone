import express from 'express';
import {
  getSchedules,
  getSchedule,
  createSchedule,
  addScheduleEntry,
  updateScheduleEntry,
  removeScheduleEntry,
  setFullSchedule,
  deleteSchedule,
} from '../controllers/scheduleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// New endpoints for section-based schedule management (more specific routes first)
router.patch('/:sectionId/add', roleMiddleware('Admin'), addScheduleEntry);
router.patch('/:sectionId/update/:entryIndex', roleMiddleware('Admin'), updateScheduleEntry);
router.patch('/:sectionId/remove/:entryIndex', roleMiddleware('Admin'), removeScheduleEntry);
router.patch('/:sectionId/set', roleMiddleware('Admin'), setFullSchedule);

// GET /:id or /:sectionId - handled in controller (tries document ID first, then sectionId)
router.get('/:id', getSchedule);

// Legacy endpoints (for backward compatibility)
router.route('/').get(getSchedules).post(roleMiddleware('Admin'), createSchedule);
router.route('/:id').delete(roleMiddleware('Admin'), deleteSchedule);

export default router;

