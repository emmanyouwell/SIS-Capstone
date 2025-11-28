import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService.js';

// @desc    Upload image/file
// @route   POST /api/v1/uploads/image
// @access  Private
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    res.json({
      success: true,
      url: result.url,
      public_id: result.public_id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete image/file
// @route   DELETE /api/v1/uploads/:publicId
// @access  Private
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    const result = await deleteFromCloudinary(publicId);

    res.json({
      success: true,
      message: 'File deleted successfully',
      result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

