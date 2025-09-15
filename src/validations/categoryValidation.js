const { body } = require('express-validator');

const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('parentId')
    .optional()
    .isMongoId()
    .withMessage('Valid parent category ID is required'),
  
  body('priority')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Priority must be between 0 and 100'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive')
];

const updateCategoryValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('parentId')
    .optional()
    .isMongoId()
    .withMessage('Valid parent category ID is required'),
  
  body('priority')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Priority must be between 0 and 100'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive')
];

module.exports = {
  createCategoryValidation,
  updateCategoryValidation
};