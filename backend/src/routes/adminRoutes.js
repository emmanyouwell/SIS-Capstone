import express from 'express';
import {
  getAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.route('/').get(roleMiddleware('Admin'), getAdmins).post(roleMiddleware('Admin'), createAdmin);
router.route('/:id').get(roleMiddleware('Admin'), getAdmin).patch(roleMiddleware('Admin'), updateAdmin).delete(roleMiddleware('Admin'), deleteAdmin);

export default router;

