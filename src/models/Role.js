const mongoose = require('mongoose');
const { DEFAULT_ROLE_PERMISSIONS } = require('../config/constants');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    enum: ['admin', 'manager', 'cashier', 'customer', 'vendor', 'delivery']
  },
  description: {
    type: String,
    trim: true
  },
  permissions: [{
    type: String
  }],
  isDefault: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for better performance
roleSchema.index({ name: 1 });
roleSchema.index({ status: 1 });

// Set default permissions based on role name
roleSchema.pre('save', function(next) {
  if (this.isNew && DEFAULT_ROLE_PERMISSIONS[this.name]) {
    this.permissions = DEFAULT_ROLE_PERMISSIONS[this.name];
  }
  next();
});

module.exports = mongoose.model('Role', roleSchema);