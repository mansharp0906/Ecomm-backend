const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  mrp: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true
  }
});

const shippingAddressSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  country: String,
  zipCode: String,
  landmark: String
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  billingAddress: shippingAddressSchema,
  payment: {
    method: {
      type: String,
      enum: ['cod', 'card', 'upi', 'netbanking', 'wallet'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paymentGateway: String,
    paymentDate: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  total: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  shipping: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    required: true
  },
  coupon: {
    code: String,
    discount: Number
  },
  deliveryDate: Date,
  trackingNumber: String,
  shippingProvider: String,
  notes: String,
  cancellationReason: String
}, {
  timestamps: true
});


// Generate order ID before saving
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderId) {
    this.orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

// Index for better performance
orderSchema.index({ user: 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);