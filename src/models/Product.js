
// const mongoose = require('mongoose');

// const variantSchema = new mongoose.Schema({
//  sku: {
//   type: String,
//   required: true,
//   unique: true,
//   trim: true
// }
// ,
//   price: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   mrp: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   weight: {
//     type: Number,
//     default: 0
//   },
//   stock: {
//     type: Number,
//     default: 0
//   },
//   images: [{
//     type: String
//   }],
//   attributes: [{
//     attribute: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Attribute'
//     },
//     value: String
//   }],
//   status: {
//     type: String,
//     enum: ['active', 'inactive'],
//     default: 'active'
//   }
// });

// const productSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true,
//     trim: true,
//     maxlength: 200
//   },
//   slug: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true
//   },
//   description: {
//     type: String,
//     trim: true
//   },
//   shortDescription: {
//     type: String,
//     trim: true,
//     maxlength: 300
//   },
//   sku: {
//     type: String,
//     unique: true,
//     sparse: true
//   },
//   barcode: {
//     type: String,
//     unique: true,
//     sparse: true
//   },
//   brand: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Brand'
//   },
//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category',
//     required: true
//   },
//   subCategory: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category'
//   },
//   variants: [variantSchema],
//   attributes: [{
//     attribute: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Attribute'
//     },
//     values: [String]
//   }],
//   images: [{
//     type: String
//   }],
//   thumbnail: {
//     type: String,
//     required: true
//   },
//   type: {
//     type: String,
//     enum: ['physical', 'digital'],
//     default: 'physical'
//   },
//   unit: {
//     type: String,
//     default: 'pcs'
//   },
//   minOrderQty: {
//     type: Number,
//     default: 1,
//     min: 1
//   },
//   tax: {
//     type: Number,
//     default: 0
//   },
//   taxType: {
//     type: String,
//     enum: ['inclusive', 'exclusive'],
//     default: 'exclusive'
//   },
//   shippingCost: {
//     type: Number,
//     default: 0
//   },
//   weight: {
//     type: Number,
//     default: 0
//   },
//   dimensions: {
//     length: Number,
//     width: Number,
//     height: Number
//   },
//   // Store-specific visibility and stock
//   storeVisibility: [{
//     store: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Store'
//     },
//     stock: {
//       type: Number,
//       default: 0
//     },
//     threshold: {
//       type: Number,
//       default: 5
//     },
//     visible: {
//       type: Boolean,
//       default: true
//     }
//   }],
//   status: {
//     type: String,
//     enum: ['active', 'inactive', 'draft'],
//     default: 'draft'
//   },
//   featured: {
//     type: Boolean,
//     default: false
//   },
//   metaTitle: String,
//   metaDescription: String,
//   pdf: {
//     type: String,
//     default: null
//   },
//   tags: [String],
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// }, {
//   timestamps: true
// });

// productSchema.pre('validate', function(next) {
//   if ((!this.variants || this.variants.length === 0) && !this.sku) {
//     return next(new Error('SKU is required if no variants exist'));
//   }
//   next();
// });


// // Create slug from title
// productSchema.pre('save', function(next) {
//   if (this.isModified('title') && !this.slug) {
//     this.slug = this.title.toLowerCase()
//       .replace(/[^a-z0-9]/g, '-')
//       .replace(/-+/g, '-')
//       .replace(/^-|-$/g, '');
//   }
//   next();
// });

// // Virtual for total stock
// productSchema.virtual('totalStock').get(function() {
//   if (this.variants && this.variants.length > 0) {
//     return this.variants.reduce((total, variant) => total + (variant.stock || 0), 0);
//   }
//   return 0;
// });

// // Virtual for low stock status
// productSchema.virtual('isLowStock').get(function() {
//   return this.totalStock <= 5; // Threshold for low stock
// });

// // Virtual for discount percentage
// productSchema.virtual('discountPercentage').get(function() {
//   if (this.variants && this.variants.length > 0) {
//     const variant = this.variants[0]; // Get first variant for reference
//     if (variant.mrp > variant.price) {
//       return Math.round(((variant.mrp - variant.price) / variant.mrp) * 100);
//     }
//   }
//   return 0;
// });

// // Include virtuals in JSON output
// productSchema.set('toJSON', { virtuals: true });

// // Indexes for better performance
// productSchema.index({ slug: 1 });
// productSchema.index({ category: 1 });
// productSchema.index({ brand: 1 });
// productSchema.index({ status: 1 });
// productSchema.index({ featured: 1 });
// productSchema.index({ type: 1 });
// productSchema.index({ tags: 1 });
// productSchema.index({ 'variants.sku': 1 }, { unique: true, sparse: true });

// productSchema.index({ createdAt: -1 });

// module.exports = mongoose.model('Product', productSchema);
const mongoose = require('mongoose');

// Variant Schema
const variantSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
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
  weight: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    default: 0
  },
  images: [{
    type: String
  }],
  attributes: [{
    attribute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attribute'
    },
    value: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
});

// Product Schema
const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
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
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 300
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  variants: [variantSchema],
  attributes: [{
    attribute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attribute'
    },
    values: [String]
  }],
  images: [{
    type: String
  }],
  thumbnail: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['physical', 'digital'],
    default: 'physical'
  },
  unit: {
    type: String,
    default: 'pcs'
  },
  minOrderQty: {
    type: Number,
    default: 1,
    min: 1
  },
  tax: {
    type: Number,
    default: 0
  },
  taxType: {
    type: String,
    enum: ['inclusive', 'exclusive'],
    default: 'exclusive'
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  weight: {
    type: Number,
    default: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  metaTitle: String,
  metaDescription: String,
  pdf: {
    type: String,
    default: null
  },
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});


// Hooks & Validations

// Validate SKU if no variants
productSchema.pre('validate', function(next) {
  if ((!this.variants || this.variants.length === 0) && !this.sku) {
    return next(new Error('SKU is required if no variants exist'));
  }
  next();
});

// Auto-generate slug from title
productSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});


// Virtuals

// Total stock
productSchema.virtual('totalStock').get(function() {
  if (this.variants && this.variants.length > 0) {
    return this.variants.reduce((total, variant) => total + (variant.stock || 0), 0);
  }
  return this.stock || 0;
});

// Low stock alert
productSchema.virtual('isLowStock').get(function() {
  return this.totalStock <= 5;
});

// Discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.variants && this.variants.length > 0) {
    const variant = this.variants[0]; // reference first variant
    if (variant.mrp > variant.price) {
      return Math.round(((variant.mrp - variant.price) / variant.mrp) * 100);
    }
  }
  if (this.mrp > this.price) {
    return Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
  return 0;
});

// Output virtuals in JSON
productSchema.set('toJSON', { virtuals: true });

// Indexes
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ status: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ type: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ 'variants.sku': 1 }, { unique: true, sparse: true });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
