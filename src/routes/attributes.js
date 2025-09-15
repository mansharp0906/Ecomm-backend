const express = require('express');
const {
  createAttribute,
  getAttributes,
  getAttribute,
  updateAttribute,
  deleteAttribute,
  toggleAttributeStatus
} = require('../controllers/attributeController');
const { auth, requireRole, requirePermission } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { createAttributeValidation, updateAttributeValidation } = require('../validations/attributeValidation');

const router = express.Router();

// Public routes
router.get('/', getAttributes);
router.get('/:id', getAttribute);

// Protected routes
router.post('/', auth, requirePermission('attribute.create'), createAttributeValidation, handleValidationErrors, createAttribute);
router.put('/:id', auth, requirePermission('attribute.update'), updateAttributeValidation, handleValidationErrors, updateAttribute);
router.delete('/:id', auth, requirePermission('attribute.delete'), deleteAttribute);
router.patch('/:id/status', auth, requirePermission('attribute.update'), toggleAttributeStatus);

module.exports = router;