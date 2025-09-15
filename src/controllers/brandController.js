const { validationResult } = require('express-validator');
const Brand = require('../models/Brand');
const Product = require('../models/Product');

// Create a new brand
exports.createBrand = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, logo, status, metaTitle, metaDescription } = req.body;
    
    const brand = new Brand({
      name,
      description,
      logo,
      status: status || 'active',
      metaTitle,
      metaDescription
    });

    await brand.save();
    
    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: { brand }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Brand with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all brands with filtering and pagination
exports.getBrands = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search, 
      status 
    } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const brands = await Brand.find(query)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('productCount')
      .populate('orderCount');
    
    const total = await Brand.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        brands,
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

// Get single brand
exports.getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id)
      .populate('productCount')
      .populate('orderCount');
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    
    res.json({
      success: true,
      data: { brand }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update brand
exports.updateBrand = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, logo, status, metaTitle, metaDescription } = req.body;
    
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { name, description, logo, status, metaTitle, metaDescription },
      { new: true, runValidators: true }
    );
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Brand updated successfully',
      data: { brand }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Brand with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete brand
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    
    // Check if brand has products
    const productCount = await Product.countDocuments({ brand: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete brand with products. Please reassign or delete products first.' 
      });
    }
    
    await Brand.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Toggle brand status
exports.toggleBrandStatus = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    
    brand.status = brand.status === 'active' ? 'inactive' : 'active';
    await brand.save();
    
    res.json({
      success: true,
      message: `Brand ${brand.status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: { brand }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};