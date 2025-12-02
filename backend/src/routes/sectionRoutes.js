import express from 'express';
import {
  getSections,
  getSection,
  createSection,
  updateSection,
  deleteSection,
} from '../controllers/sectionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.route('/').get(getSections).post(roleMiddleware('Admin'), createSection);
router
  .route('/:id')
  .get(getSection)
  .patch(roleMiddleware('Admin'), updateSection)
  .delete(roleMiddleware('Admin'), deleteSection);

export default router;

