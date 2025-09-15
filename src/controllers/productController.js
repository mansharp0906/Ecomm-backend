const { validationResult } = require('express-validator');
const Product = require('../models/Product');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const productData = {
      ...req.body,
      createdBy: req.user._id
    };

    const product = new Product(productData);
    await product.save();
    
    // Populate references
    await product.populate([
      { path: 'brand', select: 'name logo' },
      { path: 'category', select: 'name' },
      { path: 'subCategory', select: 'name' }
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU or barcode already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all products with filtering and pagination
exports.getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search, 
      status,
      featured,
      type,
      brand,
      category,
      subCategory,
      minPrice,
      maxPrice,
      lowStock
    } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }
    
    if (type) {
      query.type = type;
    }
    
    if (brand) {
      query.brand = brand;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (subCategory) {
      query.subCategory = subCategory;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (minPrice || maxPrice) {
      query['variants.price'] = {};
      if (minPrice) query['variants.price'].$gte = parseFloat(minPrice);
      if (maxPrice) query['variants.price'].$lte = parseFloat(maxPrice);
    }
    
    if (lowStock === 'true') {
      query.$expr = { $lte: [{ $sum: '$variants.stock' }, 5] };
    }
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('brand', 'name logo')
      .populate('category', 'name')
      .populate('subCategory', 'name');
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('brand', 'name logo')
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('attributes.attribute', 'name values')
      .populate('variants.attributes.attribute', 'name values');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('brand', 'name logo')
    .populate('category', 'name')
    .populate('subCategory', 'name');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU or barcode already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if product has orders
    const Order = require('../models/Order');
    const orderCount = await Order.countDocuments({
      'items.product': req.params.id
    });
    
    if (orderCount > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete product that has orders. Please archive it instead.' 
      });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Toggle product status
exports.toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    product.status = product.status === 'active' ? 'inactive' : 'active';
    await product.save();
    
    res.json({
      success: true,
      message: `Product ${product.status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: { product }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Toggle featured status
exports.toggleFeaturedStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    product.featured = !product.featured;
    await product.save();
    
    res.json({
      success: true,
      message: `Product ${product.featured ? 'added to' : 'removed from'} featured section successfully`,
      data: { product }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update product stock
exports.updateProductStock = async (req, res) => {
  try {
    const { variantId, stock } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (variantId) {
      // Update specific variant stock
      const variant = product.variants.id(variantId);
      if (!variant) {
        return res.status(404).json({
          success: false,
          message: 'Variant not found'
        });
      }
      variant.stock = stock;
    } else {
      // Update all variants stock (for simple products)
      product.variants.forEach(variant => {
        variant.stock = stock;
      });
    }
    
    await product.save();
    
    res.json({
      success: true,
      message: 'Product stock updated successfully',
      data: { product }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Bulk update products
exports.bulkUpdateProducts = async (req, res) => {
  try {
    const { ids, updateData } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs are required'
      });
    }
    
    const result = await Product.updateMany(
      { _id: { $in: ids } },
      updateData
    );
    
    res.json({
      success: true,
      message: `${result.modifiedCount} products updated successfully`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Export products
exports.exportProducts = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const products = await Product.find()
      .populate('brand', 'name')
      .populate('category', 'name')
      .populate('subCategory', 'name');
    
    if (format === 'csv') {
      // Convert to CSV format
      const { Parser } = require('json2csv');
      const fields = ['title', 'sku', 'barcode', 'brand.name', 'category.name', 'type', 'status', 'price', 'stock'];
      const parser = new Parser({ fields });
      const csv = parser.parse(products);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
      return res.send(csv);
    }
    
    // Default to JSON
    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};