const orderService = require('../services/orderService');
const { validationResult } = require('express-validator');

const createOrder = async (req, res) => {
  console.log('req.body:', req.body);

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const order = await orderService.createOrder(req.user._id, req.body);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const result = await orderService.getUserOrders(
      req.user._id, 
      { status }, 
      parseInt(page), 
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: {
        orders: result.orders,
        pagination: result.pagination
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user._id);
    
    res.json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user._id, req.body.reason);
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        order
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (userId) filters.user = userId;
    
    const result = await orderService.getAllOrders(filters, parseInt(page), parseInt(limit));
    
    res.json({
      success: true,
      data: {
        orders: result.orders,
        pagination: result.pagination
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        order
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
  createOrder,
  getUserOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
};