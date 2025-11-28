import express from 'express';
import {
  getGrades,
  getGrade,
  createGrade,
  updateGrade,
  deleteGrade,
} from '../controllers/gradeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router
  .route('/')
  .get(getGrades)
  .post(roleMiddleware('Admin', 'Teacher'), createGrade);

router
  .route('/:id')
  .get(getGrade)
  .patch(roleMiddleware('Admin', 'Teacher'), updateGrade)
  .delete(roleMiddleware('Admin', 'Teacher'), deleteGrade);

export default router;

