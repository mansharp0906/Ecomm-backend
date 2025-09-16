const Category = require('../models/Category');

const createCategory = async (categoryData) => {
  const category = new Category(categoryData);
  return await category.save();
};

const getCategoryById = async (id) => {
  return await Category.findById(id).populate('parentId', 'name slug');
};

const getCategoryBySlug = async (slug) => {
  return await Category.findOne({ slug }).populate('parentId', 'name slug');
};

const getAllCategories = async (filters = {}) => {
  const { level, parentId, status, featured } = filters;
  let query = {};
  
  if (level !== undefined) query.level = level;
  if (parentId !== undefined) query.parentId = parentId;
  if (status) query.status = status;
  if (featured !== undefined) query.isFeatured = featured;
  
  return await Category.find(query)
    .populate('parentId', 'name slug')
    .sort({ priority: -1, name: 1 });
};

const getCategoryTree = async (parentId = null) => {
  const categories = await Category.find({ parentId, status: 'active' })
    .populate('children')
    .sort({ priority: -1, name: 1 });
  
  for (let category of categories) {
    category.children = await getCategoryTree(category._id);
  }
  
  return categories;
};

const updateCategory = async (id, updateData) => {
  return await Category.findByIdAndUpdate(id, updateData, { 
    new: true, 
    runValidators: true 
  });
};

const deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id);
};

const getCategoryProducts = async (categoryId, page = 1, limit = 10, filters = {}) => {
  // This would typically interact with the Product model
  // Implementation depends on your product filtering needs
  const skip = (page - 1) * limit;
  
  let query = { category: categoryId, status: 'active' };
  
  // Apply additional filters (brand, price range, attributes, etc.)
  if (filters.brand) query.brand = filters.brand;
  if (filters.minPrice || filters.maxPrice) {
    query['variants.price'] = {};
    if (filters.minPrice) query['variants.price'].$gte = filters.minPrice;
    if (filters.maxPrice) query['variants.price'].$lte = filters.maxPrice;
  }
  
  const products = await Product.find(query)
    .populate('brand', 'name slug')
    .populate('category', 'name slug')
    .skip(skip)
    .limit(limit)
    .sort({ featured: -1, createdAt: -1 });
  
  const total = await Product.countDocuments(query);
  
  return {
    products,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page
  };
};

module.exports = {
  createCategory,
  getCategoryById,
  getCategoryBySlug,
  getAllCategories,
  getCategoryTree,
  updateCategory,
  deleteCategory,
  getCategoryProducts
};