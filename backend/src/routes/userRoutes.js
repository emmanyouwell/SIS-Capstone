import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  deactivateUser,
} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.route('/').get(roleMiddleware('Admin'), getUsers).post(roleMiddleware('Admin'), createUser);
router.route('/:id/deactivate').patch(roleMiddleware('Admin'), deactivateUser);
router.route('/:id').get(getUser).patch(updateUser).delete(roleMiddleware('Admin'), deleteUser);

export default router;

