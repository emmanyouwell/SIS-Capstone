import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  deactivateUser,
  getLoginStats,
  getDailyLoginStats,
} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.route('/').get(roleMiddleware('Admin'), getUsers).post(roleMiddleware('Admin'), createUser);
router.route('/stats/logins').get(roleMiddleware('Admin'), getLoginStats);
router.route('/stats/logins/daily').get(roleMiddleware('Admin'), getDailyLoginStats);
router.route('/:id/deactivate').patch(roleMiddleware('Admin'), deactivateUser);
router.route('/:id').get(getUser).patch(updateUser).delete(roleMiddleware('Admin'), deleteUser);

export default router;

