const { uploadToCloudinary, uploadMultipleToCloudinary } = require('../utils/cloudinaryUpload');

/**
 * Controller to upload a single image (base64 or URL)
 */
const uploadSingleImage = async (req, res) => {
  try {
  

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const folder = req.body.folder || 'default';
    const url = await uploadToCloudinary(req.file, folder);

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: { url }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Controller to upload multiple images (array of base64 or URLs)
 */
const uploadMultipleImages = async (req, res) => {
  try {
    const { images, folder } = req.body;

    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }

    // Prepare files as buffers
    const filesInfo = images.map(img => ({
      buffer: Buffer.from(img.split(',')[1], 'base64'),
      mimetype: 'image/jpeg'
    }));

    // Upload all files to Cloudinary
    const urls = await uploadMultipleToCloudinary(filesInfo, folder || 'default');

    const data = urls.map((url, index) => ({
      url
    }));

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages
};
