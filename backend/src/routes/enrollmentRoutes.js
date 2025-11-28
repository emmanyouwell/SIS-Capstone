import express from 'express';
import {
  getEnrollments,
  getEnrollment,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
} from '../controllers/enrollmentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router
  .route('/')
  .get(getEnrollments)
  .post(roleMiddleware('Student'), createEnrollment);

router
  .route('/:id')
  .get(getEnrollment)
  .patch(roleMiddleware('Admin'), updateEnrollment)
  .delete(deleteEnrollment);

export default router;

