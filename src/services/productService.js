const Product = require('../models/Product');

const createProduct = async (productData) => {
  const product = new Product(productData);
  return await product.save();
};

const getProductById = async (id) => {
  return await Product.findById(id)
    .populate('brand', 'name slug logo')
    .populate('category', 'name slug')
    .populate('subCategory', 'name slug')
    .populate('attributes.attribute', 'name slug displayType')
    .populate('variants.attributes.attribute', 'name slug displayType'); // Corrected for variant attributes
};

const getProductBySlug = async (slug) => {
  return await Product.findOne({ slug })
    .populate('brand', 'name slug logo')
    .populate('category', 'name slug')
    .populate('subCategory', 'name slug')
    .populate('attributes.attribute', 'name slug displayType')
    .populate('variants.attributes.attribute', 'name slug displayType'); // Corrected
};

const getAllProducts = async (filters = {}, page = 1, limit = 10, sort = {}) => {
  const skip = (page - 1) * limit;
  
  let query = {};
  
  // Apply filters
  if (filters.category) query.category = filters.category;
  if (filters.brand) query.brand = filters.brand;
  if (filters.status) query.status = filters.status;
  if (filters.featured !== undefined) query.featured = filters.featured;
  if (filters.minPrice || filters.maxPrice) {
    query['variants.price'] = {};
    if (filters.minPrice) query['variants.price'].$gte = filters.minPrice;
    if (filters.maxPrice) query['variants.price'].$lte = filters.maxPrice;
  }
  
  // Text search (ensure you created a text index on title/description)
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  
  // Default sort
  if (Object.keys(sort).length === 0) {
    sort = { createdAt: -1 };
  }
  
  const products = await Product.find(query)
    .populate('brand', 'name slug logo')
    .populate('category', 'name slug')
    .populate('subCategory', 'name slug')
    .populate('attributes.attribute', 'name slug displayType')
    .populate('variants.attributes.attribute', 'name slug displayType')
    .skip(skip)
    .limit(limit)
    .sort(sort);
  
  const total = await Product.countDocuments(query);
  
  return {
    products,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page
  };
};

const updateProduct = async (id, updateData) => {
  return await Product.findByIdAndUpdate(id, updateData, { 
    new: true, 
    runValidators: true 
  });
};

const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};

const getFeaturedProducts = async (limit = 10) => {
  return await Product.find({ 
    featured: true, 
    status: 'active' 
  })
    .populate('brand', 'name slug logo')
    .populate('category', 'name slug')
    .populate('subCategory', 'name slug')
    .populate('attributes.attribute', 'name slug displayType')
    .populate('variants.attributes.attribute', 'name slug displayType')
    .limit(limit)
    .sort({ createdAt: -1 });
};

const getRelatedProducts = async (productId, categoryId, limit = 5) => {
  return await Product.find({ 
    category: categoryId, 
    status: 'active',
    _id: { $ne: productId }
  })
    .populate('brand', 'name slug logo')
    .populate('category', 'name slug')
    .populate('subCategory', 'name slug')
    .populate('attributes.attribute', 'name slug displayType')
    .populate('variants.attributes.attribute', 'name slug displayType')
    .limit(limit)
    .sort({ createdAt: -1 });
};

module.exports = {
  createProduct,
  getProductById,
  getProductBySlug,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getRelatedProducts
};
