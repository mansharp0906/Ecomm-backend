const express = require('express');
const router = express.Router();
const { uploadSingleImage, uploadMultipleImages } = require('../controllers/fileUploadOnCloudinary');
const multer = require('multer');

const storage = multer.memoryStorage(); // memory storage
const upload = multer({ storage });

router.post('/upload-single', upload.single('image'), uploadSingleImage);

// Multiple files upload
router.post('/upload-multiple',  uploadMultipleImages); // max 10 files

module.exports = router;
