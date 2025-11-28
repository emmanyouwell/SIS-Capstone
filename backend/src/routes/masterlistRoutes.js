import express from 'express';
import {
  getMasterlists,
  getMasterlist,
  createMasterlist,
  updateMasterlist,
  deleteMasterlist,
} from '../controllers/masterlistController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.route('/').get(getMasterlists).post(roleMiddleware('Admin'), createMasterlist);
router
  .route('/:id')
  .get(getMasterlist)
  .patch(roleMiddleware('Admin'), updateMasterlist)
  .delete(roleMiddleware('Admin'), deleteMasterlist);

export default router;

