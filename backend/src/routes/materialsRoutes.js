import express from 'express';
import {
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from '../controllers/materialsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router
  .route('/')
  .get(getMaterials)
  .post(roleMiddleware('Admin', 'Teacher'), createMaterial);

router
  .route('/:id')
  .get(getMaterial)
  .patch(roleMiddleware('Admin', 'Teacher'), updateMaterial)
  .delete(roleMiddleware('Admin', 'Teacher'), deleteMaterial);

export default router;

