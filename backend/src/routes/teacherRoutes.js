import express from 'express';
import {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacherController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.route('/').get(getTeachers).post(roleMiddleware('Admin'), createTeacher);
router.route('/:id').get(getTeacher).patch(roleMiddleware('Admin'), updateTeacher).delete(roleMiddleware('Admin'), deleteTeacher);

export default router;

