import express from 'express';
import {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.route('/').get(getSubjects).post(roleMiddleware('Admin'), createSubject);
router
  .route('/:id')
  .get(getSubject)
  .patch(roleMiddleware('Admin', 'Teacher'), updateSubject)
  .delete(roleMiddleware('Admin'), deleteSubject);

export default router;

