import express from 'express';
import { uploadImage, deleteImage } from '../controllers/uploadController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../../config/cloudinary.js';

const router = express.Router();

router.post('/image', authMiddleware, upload.single('file'), uploadImage);
router.delete('/:publicId', authMiddleware, deleteImage);

export default router;

