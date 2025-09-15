const express = require('express');
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  toggleFeaturedStatus,
  updateProductStock,
  bulkUpdateProducts,
  exportProducts
} = require('../controllers/productController');
const { auth, requireRole, requirePermission } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { createProductValidation, updateProductValidation } = require('../validations/productValidation');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);
router.get('/export/products', exportProducts);

// Protected routes
router.post('/', auth, requirePermission('product.create'), createProductValidation, handleValidationErrors, createProduct);
router.put('/:id', auth, requirePermission('product.update'), updateProductValidation, handleValidationErrors, updateProduct);
router.delete('/:id', auth, requirePermission('product.delete'), deleteProduct);
router.patch('/:id/status', auth, requirePermission('product.update'), toggleProductStatus);
router.patch('/:id/featured', auth, requirePermission('product.update'), toggleFeaturedStatus);
router.patch('/:id/stock', auth, requirePermission('product.update'), updateProductStock);
router.post('/bulk-update', auth, requirePermission('product.update'), bulkUpdateProducts);

module.exports = router;