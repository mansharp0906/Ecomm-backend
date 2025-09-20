// const { body } = require('express-validator');

// const createUserValidation = [
//   body('name')
//     .trim()
//     .notEmpty()
//     .withMessage('Name is required')
//     .isLength({ min: 2, max: 100 })
//     .withMessage('Name must be between 2 and 100 characters'),
  
//   body('email')
//     .isEmail()
//     .withMessage('Please enter a valid email')
//     .normalizeEmail(),
  
//   body('password')
//     .isLength({ min: 6 })
//     .withMessage('Password must be at least 6 characters long')
//     .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
//     .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
//   body('role')
//     .isMongoId()
//     .withMessage('Valid role ID is required')
// ];

// const updateUserValidation = [
//   body('name')
//     .optional()
//     .trim()
//     .notEmpty()
//     .withMessage('Name cannot be empty')
//     .isLength({ min: 2, max: 100 })
//     .withMessage('Name must be between 2 and 100 characters'),
  
//   body('email')
//     .optional()
//     .isEmail()
//     .withMessage('Please enter a valid email')
//     .normalizeEmail(),
  
//   body('role')
//     .optional()
//     .isMongoId()
//     .withMessage('Valid role ID is required')
// ];

// module.exports = {
//   createUserValidation,
//   updateUserValidation
// };
const { body } = require('express-validator');

const createUserValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'customer', 'vendor'])
    .withMessage('Invalid role')
];

const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'customer', 'vendor'])
    .withMessage('Invalid role'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Invalid status')
];

module.exports = {
  createUserValidation,
  updateUserValidation
};