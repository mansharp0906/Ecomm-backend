const { body } = require('express-validator');

const cartItemValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  
  body('variantId')
    .isMongoId()
    .withMessage('Valid variant ID is required'),
  
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
];

module.exports = {
  cartItemValidation
};