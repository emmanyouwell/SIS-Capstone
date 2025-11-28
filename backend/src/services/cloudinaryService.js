import { cloudinary } from '../../config/cloudinary.js';

export const uploadToCloudinary = (buffer, folder = 'sis-capstone') => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'auto',
    };

    // Convert buffer to base64 data URI
    const base64Data = buffer.toString('base64');
    const dataUri = `data:application/octet-stream;base64,${base64Data}`;

    cloudinary.uploader.upload(
      dataUri,
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    );
  });
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw error;
  }
};

