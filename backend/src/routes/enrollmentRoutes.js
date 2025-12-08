import express from 'express';
import {
  getEnrollments,
  getEnrollment,
  createEnrollment,
  adminCreateEnrollment,
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

// Admin-only route for creating enrollments
router
  .route('/admin')
  .post(roleMiddleware('Admin'), adminCreateEnrollment);

router
  .route('/:id')
  .get(getEnrollment)
  .patch(roleMiddleware('Admin'), updateEnrollment)
  .delete(deleteEnrollment);

export default router;

