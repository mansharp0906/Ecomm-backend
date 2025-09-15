const { validationResult } = require('express-validator');
const Category = require('../models/Category');

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, parentId, priority, image, status } = req.body;
    
    const category = new Category({
      name,
      description,
      parentId: parentId || null,
      priority: priority || 0,
      image,
      status: status || 'active'
    });

    await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all categories with filtering and pagination
exports.getCategories = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      parentId, 
      level, 
      search, 
      status 
    } = req.query;
    
    let query = {};
    
    if (parentId) {
      query.parentId = parentId === 'null' ? null : parentId;
    }
    
    if (level) {
      query.level = parseInt(level);
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const categories = await Category.find(query)
      .sort({ priority: -1, name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('parentId', 'name');
    
    const total = await Category.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        categories,
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

// Get single category
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentId', 'name');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, parentId, priority, image, status } = req.body;
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, parentId, priority, image, status },
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if category has children
    const childCount = await Category.countDocuments({ parentId: req.params.id });
    if (childCount > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete category with subcategories. Please delete subcategories first.' 
      });
    }
    
    // Check if category has products
    const Product = require('../models/Product');
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete category with products. Please reassign or delete products first.' 
      });
    }
    
    await Category.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get category tree
exports.getCategoryTree = async (req, res) => {
  try {
    const buildTree = async (parentId = null) => {
      const categories = await Category.find({ parentId, status: 'active' })
        .sort({ priority: -1, name: 1 });
      
      const result = [];
      
      for (const category of categories) {
        const children = await buildTree(category._id);
        result.push({
          _id: category._id,
          name: category.name,
          slug: category.slug,
          priority: category.priority,
          children
        });
      }
      
      return result;
    };
    
    const tree = await buildTree();
    res.json({
      success: true,
      data: { tree }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};