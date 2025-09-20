const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'card', 'upi', 'netbanking', 'wallet'],
    required: true
  },
  paymentGateway: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  gatewayResponse: mongoose.Schema.Types.Mixed,
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: String
}, {
  timestamps: true
});

// Generate transaction ID before saving
transactionSchema.pre('save', function(next) {
  if (this.isNew) {
    this.transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);