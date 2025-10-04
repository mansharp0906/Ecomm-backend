const express = require('express');
const multer = require('multer');
const router = express.Router();
const { uploadSingleImage, uploadMultipleImages } = require('../controllers/uploadController');

// Multer setup (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.post('/single', upload.single('image'), uploadSingleImage);
router.post('/multiple', upload.array('images', 10), uploadMultipleImages); // max 10 images

module.exports = router;
