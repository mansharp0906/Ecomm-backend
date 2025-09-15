const { body } = require('express-validator');

const createProductValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Product title is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product title must be between 2 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Short description cannot exceed 300 characters'),
  
  body('brand')
    .optional()
    .isMongoId()
    .withMessage('Valid brand ID is required'),
  
  body('category')
    .isMongoId()
    .withMessage('Valid category ID is required'),
  
  body('subCategory')
    .optional()
    .isMongoId()
    .withMessage('Valid sub-category ID is required'),
  
  body('type')
    .isIn(['physical', 'digital'])
    .withMessage('Product type must be either physical or digital'),
  
  body('unit')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Unit is required'),
  
  body('minOrderQty')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Minimum order quantity must be at least 1'),
  
  body('tax')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax must be between 0 and 100'),
  
  body('taxType')
    .optional()
    .isIn(['inclusive', 'exclusive'])
    .withMessage('Tax type must be either inclusive or exclusive'),
  
  body('shippingCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Shipping cost cannot be negative'),
  
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight cannot be negative'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft'])
    .withMessage('Status must be either active, inactive, or draft'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .trim()
    .notEmpty()
    .withMessage('Tag cannot be empty')
];

const updateProductValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product title cannot be empty')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product title must be between 2 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Short description cannot exceed 300 characters'),
  
  body('brand')
    .optional()
    .isMongoId()
    .withMessage('Valid brand ID is required'),
  
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Valid category ID is required'),
  
  body('subCategory')
    .optional()
    .isMongoId()
    .withMessage('Valid sub-category ID is required'),
  
  body('type')
    .optional()
    .isIn(['physical', 'digital'])
    .withMessage('Product type must be either physical or digital'),
  
  body('unit')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Unit is required'),
  
  body('minOrderQty')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Minimum order quantity must be at least 1'),
  
  body('tax')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax must be between 0 and 100'),
  
  body('taxType')
    .optional()
    .isIn(['inclusive', 'exclusive'])
    .withMessage('Tax type must be either inclusive or exclusive'),
  
  body('shippingCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Shipping cost cannot be negative'),
  
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight cannot be negative'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft'])
    .withMessage('Status must be either active, inactive, or draft'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .trim()
    .notEmpty()
    .withMessage('Tag cannot be empty')
];

module.exports = {
  createProductValidation,
  updateProductValidation
};