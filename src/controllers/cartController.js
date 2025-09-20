const cartService = require('../services/cartService');
const { validationResult } = require('express-validator');

const getCart = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user._id);
    
    res.json({
      success: true,
      data: {
        cart
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const cart = await cartService.addToCart(req.user._id, req.body);
    
    res.json({
      success: true,
      message: 'Item added to cart',
      data: {
        cart
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const cart = await cartService.updateCartItem(
      req.user._id, 
      req.params.itemId, 
      req.body.quantity
    );
    
    res.json({
      success: true,
      message: 'Cart updated',
      data: {
        cart
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const cart = await cartService.removeFromCart(req.user._id, req.params.itemId);
    
    res.json({
      success: true,
      message: 'Item removed from cart',
      data: {
        cart
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.user._id);
    
    res.json({
      success: true,
      message: 'Cart cleared',
      data: {
        cart
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};