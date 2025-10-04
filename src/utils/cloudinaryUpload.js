const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
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
const uploadToCloudinary = async (file, folder) => {
  try {
    return await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          use_filename: true,
          unique_filename: false
        },
        (error, result) => {
          if (result) {
            resolve(result.secure_url);
          } else {
            reject(error || new Error('Failed to upload image to Cloudinary'));
          }
        }
      );
      streamifier.createReadStream(file.buffer).pipe(stream);
    });
  } catch (error) {
    throw new Error('Failed to upload image to Cloudinary');
  }
};
const uploadMultipleToCloudinary = async (files, folder) => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error('Failed to upload images to Cloudinary');
  }
};

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