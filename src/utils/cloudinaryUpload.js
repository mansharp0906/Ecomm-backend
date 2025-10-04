// const cloudinary = require('../config/cloudinary');

// const uploadToCloudinary = async (file, folder) => {
//     console.log(file,"file inside cloudinary upload");
//   try {
//     const result = await cloudinary.uploader.upload(file.path, {
//       folder: folder,
//       use_filename: true,
//       unique_filename: false
//     });
//     console.log(result,"result from cloudinary result ");
//     return result.secure_url;
//   } catch (error) {
//     throw new Error('Failed to upload image to Cloudinary');
//   }
// };

// const uploadMultipleToCloudinary = async (files, folder) => {
//   try {
//     const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
//     return await Promise.all(uploadPromises);
//   } catch (error) {
//     throw new Error('Failed to upload images to Cloudinary');
//   }
// };

// const deleteFromCloudinary = async (publicId) => {
//   try {
//     await cloudinary.uploader.destroy(publicId);
//   } catch (error) {
//     throw new Error('Failed to delete image from Cloudinary');
//   }
// };

// module.exports = {
//   uploadToCloudinary,
//   uploadMultipleToCloudinary,
//   deleteFromCloudinary
// };

const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
// Upload single image
const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        use_filename: true,
        unique_filename: false,
      },
      (error, result) => {
        if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Failed to upload image to Cloudinary: ' + error.message));
        }
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

// Upload multiple images
const uploadMultipleToCloudinary = async (files, folder) => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error('Failed to upload images to Cloudinary');
  }
};

// Delete image
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error('Failed to delete image from Cloudinary');
  }
};

module.exports = {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary
};
