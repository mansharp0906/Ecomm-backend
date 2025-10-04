const { uploadToCloudinary, uploadMultipleToCloudinary } = require('../utils/cloudinaryUpload');

// Upload single image
const uploadSingleImage = async (req, res) => {
  console.log(req.file, "file data in controler");
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    const url = await uploadToCloudinary(req.file, 'products'); // folder "products"
    return res.status(200).json({ success: true, url });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Upload multiple images
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }
    const urls = await uploadMultipleToCloudinary(req.files, 'products'); // folder "products"
    return res.status(200).json({ success: true, urls });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages
};
