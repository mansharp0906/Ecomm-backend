
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { auth, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', categoryController.getAllCategories);
router.get('/tree', categoryController.getCategoryTree);
router.get('/:id', categoryController.getCategory);
router.get('/slug/:slug', categoryController.getCategoryBySlug);
router.get('/:id/products', categoryController.getCategoryProducts);

// Admin routes
router.post('/', auth, requireRole(['admin']), upload.single('image'), categoryController.createCategory);
router.put('/:id', auth, requireRole(['admin']), upload.single('image'), categoryController.updateCategory);
router.delete('/:id', auth, requireRole(['admin']), categoryController.deleteCategory);

module.exports = router;