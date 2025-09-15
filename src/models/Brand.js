const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  metaTitle: String,
  metaDescription: String
}, {
  timestamps: true
});

// Create slug from name
brandSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Virtual for product count
brandSchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'brand',
  count: true
});

// Virtual for order count (through products)
brandSchema.virtual('orderCount', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'items.product.brand',
  count: true
});

// Include virtuals in JSON output
brandSchema.set('toJSON', { virtuals: true });

// Index for better performance
brandSchema.index({ slug: 1 });
brandSchema.index({ status: 1 });

module.exports = mongoose.model('Brand', brandSchema);