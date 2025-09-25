const express = require('express');
const { 
  createOrder, 
  getUserOrders, 
  getOrder, 
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  createOfflineOrder
} = require('../controllers/orderController');
const { auth, requireRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { createOrderValidation } = require('../validations/orderValidation');

const router = express.Router();

// User routes
router.post('/', auth, createOrderValidation, handleValidationErrors, createOrder);
router.get('/my-orders', auth, getUserOrders);
router.get('/my-orders/:id', auth, getOrder);
router.put('/my-orders/:id/cancel', auth, cancelOrder);
// offline order
router.post('/create-offline', auth, requireRole(['admin', 'manager']), createOfflineOrder);
// Admin routes
router.get('/', auth, requireRole(['admin', 'manager']), getAllOrders);
router.put('/:id/status', auth, requireRole(['admin', 'manager']), updateOrderStatus);

module.exports = router;