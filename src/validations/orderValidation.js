// validations/orderValidation.js
const { body } = require('express-validator');

const addressSchema = (prefix = '') => [
  body(`${prefix}firstName`)
    .trim()
    .notEmpty()
    .withMessage(`${prefix ? prefix + ' ' : ''}First name is required`),
  
  body(`${prefix}lastName`)
    .trim()
    .notEmpty()
    .withMessage(`${prefix ? prefix + ' ' : ''}Last name is required`),
  
  body(`${prefix}email`)
    .isEmail()
    .withMessage(`Valid ${prefix ? prefix + ' ' : ''}email is required`),
  
  body(`${prefix}phone`)
    .trim()
    .notEmpty()
    .withMessage(`${prefix ? prefix + ' ' : ''}Phone number is required`),
  
  body(`${prefix}address`)
    .trim()
    .notEmpty()
    .withMessage(`${prefix ? prefix + ' ' : ''}Address is required`),
  
  body(`${prefix}city`)
    .trim()
    .notEmpty()
    .withMessage(`${prefix ? prefix + ' ' : ''}City is required`),
  
  body(`${prefix}state`)
    .trim()
    .notEmpty()
    .withMessage(`${prefix ? prefix + ' ' : ''}State is required`),
  
  body(`${prefix}country`)
    .trim()
    .notEmpty()
    .withMessage(`${prefix ? prefix + ' ' : ''}Country is required`),
  
  body(`${prefix}zipCode`)
    .trim()
    .notEmpty()
    .withMessage(`${prefix ? prefix + ' ' : ''}Zip code is required`)
];

const createOrderValidation = [
  // Shipping address validation
  ...addressSchema('shippingAddress.'),
  
  // Billing address validation (optional)
  body('billingAddress')
    .optional()
    .isObject(),
  ...addressSchema('billingAddress.').map(validation => validation.optional()),
  
  // Payment method validation
  body('paymentMethod')
    .isIn(['cod', 'card', 'upi', 'netbanking', 'wallet'])
    .withMessage('Valid payment method is required'),

  // Numeric fields validation
  body('shipping').optional().isNumeric().withMessage('Shipping must be a number'),
  body('tax').optional().isNumeric().withMessage('Tax must be a number'),
  body('discount').optional().isNumeric().withMessage('Discount must be a number')
];

module.exports = {
  createOrderValidation
};