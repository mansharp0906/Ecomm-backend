
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize, requireRole, auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/:id', productController.getProduct);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id/related', productController.getRelatedProducts);

// Admin routes
router.post('/', auth, requireRole(['admin','vendor']), productController.createProduct);
router.put('/:id', auth, requireRole(['admin']), upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 10 },
  { name: 'pdf', maxCount: 1 }
]), productController.updateProduct);
router.delete('/:id', auth,  requireRole(['admin']), productController.deleteProduct);

module.exports = router;