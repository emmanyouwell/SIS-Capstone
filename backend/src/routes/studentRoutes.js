import express from 'express';
import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.route('/').get(getStudents).post(roleMiddleware('Admin'), createStudent);
router.route('/:id').get(getStudent).patch(roleMiddleware('Admin'), updateStudent).delete(roleMiddleware('Admin'), deleteStudent);

export default router;

