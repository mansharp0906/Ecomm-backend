const express = require('express');
const {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
  toggleBrandStatus
} = require('../controllers/brandController');
const { auth, requireRole, requirePermission } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { createBrandValidation, updateBrandValidation } = require('../validations/brandValidation');

const router = express.Router();

// Public routes
router.get('/', getBrands);
router.get('/:id', getBrand);

// Protected routes
router.post('/', auth, requirePermission('brand.create'), createBrandValidation, handleValidationErrors, createBrand);
router.put('/:id', auth, requirePermission('brand.update'), updateBrandValidation, handleValidationErrors, updateBrand);
router.delete('/:id', auth, requirePermission('brand.delete'), deleteBrand);
router.patch('/:id/status', auth, requirePermission('brand.update'), toggleBrandStatus);

module.exports = router;