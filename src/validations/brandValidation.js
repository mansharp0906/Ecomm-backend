const { body } = require('express-validator');

const createBrandValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Brand name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Brand name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive')
];

const updateBrandValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Brand name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Brand name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive')
];

module.exports = {
  createBrandValidation,
  updateBrandValidation
};