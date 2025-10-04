
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Import email service
const { 
  sendOrderConfirmation, 
  sendOrderShipped, 
  sendOrderDelivered, 
  sendPaymentSuccess, 
  sendOrderCancelled 
} = require('../services/emailService');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// --- CREATE OFFLINE ORDER (POS Billing) ---
const createOfflineOrder = async (cashierId, orderData) => {
  let total = 0;
  const orderItems = [];

  for (const item of orderData.items) {
    const product = await Product.findById(item.product);
    const variant = product.variants.id(item.variant);

    if (!variant || variant.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.title}`);
    }

    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    orderItems.push({
      product: item.product,
      variant: item.variant,
      quantity: item.quantity,
      price: item.price,
      mrp: item.mrp,
      total: itemTotal
    });
  }

  const orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();

  const order = new Order({
    orderId,
    orderType: 'offline',
    customerDetails: orderData.customerDetails,
    items: orderItems,
    payment: {
      method: orderData.paymentMethod || 'cash',
      status: 'completed'
    },
    total,
    discount: orderData.discount || 0,
    tax: orderData.tax || 0,
    grandTotal: total + (orderData.tax || 0) - (orderData.discount || 0),
    counterId: orderData.counterId,
    cashier: cashierId,
    status: 'completed'
  });

  await order.save();

  // Reduce stock
  for (const item of orderItems) {
    await Product.updateOne(
      { _id: item.product, 'variants._id': item.variant },
      { $inc: { 'variants.$.stock': -item.quantity } }
    );
  }

  // Transaction log
  const transaction = new Transaction({
    order: order._id,
    user: null,
    amount: order.grandTotal,
    paymentMethod: order.payment.method,
    paymentGateway: 'POS',
    status: 'completed'
  });

  await transaction.save();

  return { order, transaction };
};

// --- CREATE ORDER ---
const createOrder = async (userId, orderData) => {
  // Get user's cart and user details
  const [cart, user] = await Promise.all([
    Cart.findOne({ user: userId }).populate('items.product'),
    User.findById(userId)
  ]);

  if (!user) throw new Error('User not found');

  let total = 0;
  const orderItems = [];

  // ✅ Case 1: Cart has items
  if (cart && cart.items.length > 0) {
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
  }
  // ✅ Case 2: No cart, use orderData.items
  else if (orderData.items && orderData.items.length > 0) {
    for (const item of orderData.items) {
      const product = await Product.findById(item.product);
      const variant = product.variants.id(item.variant);

      if (!variant || variant.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.title}`);
      }

      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        product: item.product,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price,
        mrp: item.mrp,
        total: itemTotal
      });
    }
  } else {
    throw new Error('No items found in cart or order request');
  }

  const orderId =
    'ORD' +
    Date.now() +
    Math.random().toString(36).substr(2, 9).toUpperCase();

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
    grandTotal:
      total +
      (orderData.shipping || 0) +
      (orderData.tax || 0) -
      (orderData.discount || 0)
  });

  await order.save();

  // Update product stock
  for (const item of orderItems) {
    await Product.updateOne(
      { _id: item.product, 'variants._id': item.variant },
      { $inc: { 'variants.$.stock': -item.quantity } }
    );
  }

  // ✅ Clear cart only if order was placed using cart
  if (cart && cart.items.length > 0) {
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [], total: 0, discount: 0, shipping: 0, tax: 0, grandTotal: 0 } }
    );
  }

  // Create transaction
  const transaction = new Transaction({
    order: order._id,
    user: userId,
    amount: order.grandTotal,
    paymentMethod: orderData.paymentMethod,
    paymentGateway: orderData.paymentMethod === 'cod' ? 'COD' : 'RAZORPAY',
    status: orderData.paymentMethod === 'cod' ? 'pending' : 'processing'
  });

  await transaction.save();

  // Send order confirmation email
  try {
    await sendOrderConfirmation(order, user);
    console.log('✅ Order confirmation email sent');
  } catch (emailError) {
    console.error('❌ Failed to send order confirmation email:', emailError);
  }

  return { order, transaction };
};

// --- VERIFY RAZORPAY PAYMENT ---
const verifyPayment = async (razorpay_payment_id, razorpay_order_id, razorpay_signature, transactionId) => {
  const transaction = await Transaction.findOne({ transactionId }).populate('user');
  if (!transaction) throw new Error('Transaction not found');

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    transaction.status = 'failed';
    await transaction.save();
    throw new Error('Payment verification failed');
  }

  // Update transaction
  transaction.status = 'completed';
  transaction.gatewayResponse = { razorpay_payment_id, razorpay_order_id };
  await transaction.save();

  // Update order payment status
  const order = await Order.findById(transaction.order).populate('user');
  order.payment.status = 'completed';
  order.status = 'confirmed';
  await order.save();

  // Send payment success email
  try {
    await sendPaymentSuccess(order, transaction.user, transaction);
    console.log('✅ Payment success email sent');
  } catch (emailError) {
    console.error('❌ Failed to send payment success email:', emailError);
  }

  return order;
};

// --- UPDATE ORDER STATUS (with notifications) ---
const updateOrderStatus = async (orderId, status, trackingInfo = null) => {
  const order = await Order.findById(orderId).populate('user');
  if (!order) throw new Error('Order not found');

  const previousStatus = order.status;
  order.status = status;
  
  if (status === 'shipped' && trackingInfo) {
    order.trackingNumber = trackingInfo.trackingNumber;
    order.carrier = trackingInfo.carrier;
    order.estimatedDelivery = trackingInfo.estimatedDelivery;
  }

  if (status === 'delivered') {
    order.deliveryDate = new Date();
  }

  await order.save();

  // Send appropriate notifications based on status change
  try {
    switch (status) {
      case 'shipped':
        if (order.user) {
          await sendOrderShipped(order, order.user, trackingInfo || {});
          console.log('✅ Order shipped email sent');
        }
        break;
      
      case 'delivered':
        if (order.user) {
          await sendOrderDelivered(order, order.user);
          console.log('✅ Order delivered email sent');
        }
        break;
    }
  } catch (emailError) {
    console.error('❌ Failed to send status update email:', emailError);
  }

  return order;
};

// --- CANCEL ORDER (with notification) ---
const cancelOrder = async (orderId, userId, reason) => {
  const [order, user] = await Promise.all([
    Order.findOne({ _id: orderId, user: userId }),
    User.findById(userId)
  ]);

  if (!order) throw new Error('Order not found');
  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new Error('Order cannot be cancelled at this stage');
  }

  order.status = 'cancelled';
  order.cancellationReason = reason;
  await order.save();

  // Restore product stock
  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.product, 'variants._id': item.variant },
      { $inc: { 'variants.$.stock': item.quantity } }
    );
  }

  // Send cancellation email
  try {
    if (user) {
      await sendOrderCancelled(order, user, reason);
      console.log('✅ Order cancellation email sent');
    }
  } catch (emailError) {
    console.error('❌ Failed to send cancellation email:', emailError);
  }

  return order;
};

// --- OTHER ORDER FUNCTIONS (keep existing) ---
const createPaymentOrder = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new Error('Order not found');

  const transaction = await Transaction.findOne({ order: orderId, user: userId });
  if (!transaction) throw new Error('Transaction not found');

  const paymentOrder = await razorpay.orders.create({
    amount: order.grandTotal * 100,
    currency: 'INR',
    receipt: transaction.transactionId
  });

  return { paymentOrder, transaction };
};

const getUserOrders = async (userId, filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const query = { user: userId };
  if (filters.status) query.status = filters.status;

  const orders = await Order.find(query)
    .populate('items.product', 'title thumbnail')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(query);

  return {
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
};

const getOrderById = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, user: userId })
    .populate('items.product')
    .populate('user', 'name email');

  if (!order) throw new Error('Order not found');
  return order;
};

const getAllOrders = async (filters = {}, page = 1, limit = 10) => {
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
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
};

module.exports = {
  createOrder,
  createPaymentOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  createOfflineOrder
};