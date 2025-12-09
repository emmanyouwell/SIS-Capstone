import express from 'express';
import {
  getCurrentEnrollmentPeriod,
  getEnrollmentPeriods,
  getEnrollmentPeriod,
  createEnrollmentPeriod,
  updateEnrollmentPeriod,
  deleteEnrollmentPeriod,
} from '../controllers/enrollmentPeriodController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for checking current enrollment period (students need this)
router.get('/current', getCurrentEnrollmentPeriod);

// Admin-only routes
router.use(authMiddleware);

router
  .route('/')
  .get(roleMiddleware('Admin'), getEnrollmentPeriods)
  .post(roleMiddleware('Admin'), createEnrollmentPeriod);

router
  .route('/:id')
  .get(roleMiddleware('Admin'), getEnrollmentPeriod)
  .patch(roleMiddleware('Admin'), updateEnrollmentPeriod)
  .delete(roleMiddleware('Admin'), deleteEnrollmentPeriod);

export default router;


