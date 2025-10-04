
const { validationResult } = require('express-validator');
const orderService = require('../services/orderService');

// Create Offline Order (POS Billing)
const createOfflineOrder = async (req, res) => {
  try {
    const { order, transaction } = await orderService.createOfflineOrder(req.user._id, req.body);

    res.status(201).json({
      success: true,
      message: 'Offline order created successfully.',
      data: { order, transaction }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
// Create Order (COD or Online)
const createOrder = async (req, res) => {
  console.log("Creating order with data:", req.body);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Create order + transaction
    const { order, transaction } = await orderService.createOrder(req.user._id, req.body);

    // Notify user
    await orderService.sendNotification(req.user._id, `Order ${order.orderId} created successfully.`);

    // If online payment, return transactionId
    if (order.payment.method !== 'cod') {
      return res.status(201).json({
        success: true,
        message: 'Order created. Complete online payment.',
        data: {
          order,
          transactionId: transaction.transactionId
        }
      });
    }

    // For COD
    res.status(201).json({
      success: true,
      message: 'Order created successfully (COD).',
      data: { order }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Create Razorpay Payment Order
const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const { paymentOrder, transaction } = await orderService.createPaymentOrder(orderId, req.user._id);

    res.json({
      success: true,
      data: { paymentOrder, transactionId: transaction.transactionId }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Verify Razorpay Payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, transactionId } = req.body;
    const order = await orderService.verifyPayment(razorpay_payment_id, razorpay_order_id, razorpay_signature, transactionId);

    // Notify user
    await orderService.sendNotification(order.user._id, `Payment received for Order ${order.orderId}.`);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: { order }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get User Orders
const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const result = await orderService.getUserOrders(req.user._id, { status }, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      data: {
        orders: result.orders,
        pagination: result.pagination
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Order
const getOrder = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user._id);
    res.json({ success: true, data: { order } });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// Cancel Order
const cancelOrder = async (req, res) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user._id, req.body.reason);

    // Notify user
    await orderService.sendNotification(req.user._id, `Order ${order.orderId} has been cancelled.`);

    res.json({ success: true, message: 'Order cancelled successfully', data: { order } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Get All Orders
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (userId) filters.user = userId;

    const result = await orderService.getAllOrders(filters, parseInt(page), parseInt(limit));
    res.json({ success: true, data: { orders: result.orders, pagination: result.pagination } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update Order Status
const updateOrderStatus = async (req, res) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);

    // Notify user
    await orderService.sendNotification(order.user._id, `Order ${order.orderId} status updated to ${order.status}.`);

    res.json({ success: true, message: 'Order status updated successfully', data: { order } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  createPaymentOrder,
  verifyPayment,
  getUserOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  createOfflineOrder
};
