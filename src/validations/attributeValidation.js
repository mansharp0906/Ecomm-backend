const { body } = require('express-validator');

const createAttributeValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Attribute name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Attribute name must be between 2 and 100 characters'),
  
  body('values')
    .optional()
    .isArray()
    .withMessage('Values must be an array'),
  
  body('values.*.value')
    .trim()
    .notEmpty()
    .withMessage('Attribute value is required'),
  
  body('isFilterable')
    .optional()
    .isBoolean()
    .withMessage('isFilterable must be a boolean'),
  
  body('isRequired')
    .optional()
    .isBoolean()
    .withMessage('isRequired must be a boolean'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive')
];

const updateAttributeValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Attribute name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Attribute name must be between 2 and 100 characters'),
  
  body('values')
    .optional()
    .isArray()
    .withMessage('Values must be an array'),
  
  body('values.*.value')
    .trim()
    .notEmpty()
    .withMessage('Attribute value is required'),
  
  body('isFilterable')
    .optional()
    .isBoolean()
    .withMessage('isFilterable must be a boolean'),
  
  body('isRequired')
    .optional()
    .isBoolean()
    .withMessage('isRequired must be a boolean'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive')
];

module.exports = {
  createAttributeValidation,
  updateAttributeValidation
};