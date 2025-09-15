const mongoose = require('mongoose');

const attributeValueSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    default: null
  },
  image: {
    type: String,
    default: null
  }
});

const attributeSchema = new mongoose.Schema({
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
  values: [attributeValueSchema],
  isFilterable: {
    type: Boolean,
    default: false
  },
  isRequired: {
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

// Create slug from name
attributeSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Index for better performance
attributeSchema.index({ slug: 1 });
attributeSchema.index({ status: 1 });

module.exports = mongoose.model('Attribute', attributeSchema);