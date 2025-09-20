const express = require('express');
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} = require('../controllers/cartController');
const { auth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { cartItemValidation } = require('../validations/cartValidation');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', getCart);
router.post('/', cartItemValidation, handleValidationErrors, addToCart);
router.put('/:itemId', updateCartItem);
router.delete('/:itemId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;