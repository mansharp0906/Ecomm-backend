// const mongoose = require('mongoose');

// const categorySchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//     maxlength: 100
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
//   image: {
//     type: String,
//     default: null
//   },
//   parentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category',
//     default: null
//   },
//   priority: {
//     type: Number,
//     default: 0
//   },
//   status: {
//     type: String,
//     enum: ['active', 'inactive'],
//     default: 'active'
//   },
//   level: {
//     type: Number,
//     default: 0
//   },
//   path: {
//     type: String,
//     default: ''
//   }
// }, {
//   timestamps: true
// });

// // Create slug from name
// categorySchema.pre('save', function(next) {
//   if (this.isModified('name') && !this.slug) {
//     this.slug = this.name.toLowerCase()
//       .replace(/[^a-z0-9]/g, '-')
//       .replace(/-+/g, '-')
//       .replace(/^-|-$/g, '');
//   }
//   next();
// });

// // Build path for hierarchical categories
// categorySchema.pre('save', async function(next) {
//   if (this.parentId && this.isModified('parentId')) {
//     try {
//       const parent = await mongoose.model('Category').findById(this.parentId);
//       if (parent) {
//         this.path = parent.path ? `${parent.path}/${parent._id}` : `${parent._id}`;
//         this.level = parent.level + 1;
//       }
//     } catch (error) {
//       return next(error);
//     }
//   } else if (!this.parentId) {
//     this.path = '';
//     this.level = 0;
//   }
//   next();
// });

// // Index for better performance
// categorySchema.index({ slug: 1 });
// categorySchema.index({ parentId: 1 });
// categorySchema.index({ path: 1 });
// categorySchema.index({ status: 1 });

// module.exports = mongoose.model('Category', categorySchema);

const mongoose = require("mongoose");

 const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    priority: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    level: {
      type: Number,
      default: 0,
    },
    path: {
      type: String,
      default: "",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    metaTitle: String,
    metaDescription: String,
  },
  {
    timestamps: true,
  }
);

// Create slug from name
categorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

// Build path for hierarchical categories
categorySchema.pre("save", async function (next) {
  if (this.parentId && this.isModified("parentId")) {
    try {
      const parent = await mongoose.model("Category").findById(this.parentId);
      if (parent) {
        this.path = parent.path
          ? `${parent.path}/${parent._id}`
          : `${parent._id}`;
        this.level = parent.level + 1;
      }
    } catch (error) {
      return next(error);
    }
  } else if (!this.parentId) {
    this.path = "";
    this.level = 0;
  }
  next();
});

// Virtual for children categories
categorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parentId",
});

// Virtual for product count
categorySchema.virtual("productCount", {
  ref: "Product",
  localField: "_id",
  foreignField: "category",
  count: true,
});

// Include virtuals in JSON output
categorySchema.set("toJSON", { virtuals: true });

// Index for better performance
categorySchema.index({ slug: 1 });
categorySchema.index({ parentId: 1 });
categorySchema.index({ path: 1 });
categorySchema.index({ status: 1 });
categorySchema.index({ level: 1 });

module.exports = mongoose.model("Category", categorySchema);
