const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const createOrder = async (userId, orderData) => {
  try {
    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Check stock availability and calculate totals
    let total = 0;
    const orderItems = [];
    
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      const variant = product.variants.id(item.variant);
      
      if (!variant || variant.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.title}`);
      }
      
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      
      orderItems.push({
        product: item.product._id,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price,
        mrp: item.mrp,
        total: itemTotal
      });
    }


    // Generate unique orderId
    const orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Create order
    const order = new Order({
      orderId,
      user: userId,
      items: orderItems,
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress || orderData.shippingAddress,
      payment: {
        method: orderData.paymentMethod,
        status: orderData.paymentMethod === 'cod' ? 'pending' : 'processing'
      },
      total,
      shipping: orderData.shipping || 0,
      tax: orderData.tax || 0,
      discount: orderData.discount || 0,
      grandTotal: total + (orderData.shipping || 0) + (orderData.tax || 0) - (orderData.discount || 0)
    });

    await order.save();

    // Update product stock
    for (const item of cart.items) {
      await Product.updateOne(
        { 
          _id: item.product._id, 
          'variants._id': item.variant 
        },
        { 
          $inc: { 'variants.$.stock': -item.quantity } 
        }
      );
    }

    // Clear cart
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [], total: 0, discount: 0, shipping: 0, tax: 0, grandTotal: 0 } }
    );

    return order;
  } catch (error) {
    throw error;
  }
};

const getUserOrders = async (userId, filters = {}, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    const query = { user: userId };
    if (filters.status) {
      query.status = filters.status;
    }
    
    const orders = await Order.find(query)
      .populate('items.product', 'title thumbnail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Order.countDocuments(query);
    
    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

const getOrderById = async (orderId, userId) => {
  try {
    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('items.product')
      .populate('user', 'name email');
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    return order;
  } catch (error) {
    throw error;
  }
};

const cancelOrder = async (orderId, userId, reason) => {
  try {
    const order = await Order.findOne({ _id: orderId, user: userId });
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new Error('Order cannot be cancelled at this stage');
    }
    
    order.status = 'cancelled';
    order.cancellationReason = reason;
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.updateOne(
        { 
          _id: item.product, 
          'variants._id': item.variant 
        },
        { 
          $inc: { 'variants.$.stock': item.quantity } 
        }
      );
    }
    
    return order;
  } catch (error) {
    throw error;
  }
};

const getAllOrders = async (filters = {}, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.user) query.user = filters.user;
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Order.countDocuments(query);
    
    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'name email');
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    return order;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
};