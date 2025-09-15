const express = require('express');
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree
} = require('../controllers/categoryController');
const { auth, requireRole, requirePermission } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { createCategoryValidation, updateCategoryValidation } = require('../validations/categoryValidation');

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/:id', getCategory);

// Protected routes (admin only)
router.post('/', auth, requireRole(['admin']), createCategoryValidation, handleValidationErrors, createCategory);
router.put('/:id', auth, requireRole(['admin']), updateCategoryValidation, handleValidationErrors, updateCategory);
router.delete('/:id', auth, requireRole(['admin']), deleteCategory);

module.exports = router;