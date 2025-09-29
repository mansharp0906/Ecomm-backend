const Category = require('../models/Category');

const createCategory = async (categoryData) => {
  try {
    const category = new Category(categoryData);
    const savedCategory = await category.save();

    return {
      success: true,
      message: "Category created successfully",
      status: 201,
      data: savedCategory,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error creating category",
      status: 500,
      error: error.message,
    };
  }
};


const getCategoryById = async (id) => {
  return await Category.findById(id).populate('parentId', 'name slug');
};

const getCategoryBySlug = async (slug) => {
  return await Category.findOne({ slug }).populate('parentId', 'name slug');
};

const getAllCategories = async (filters = {}) => {
  try {
    const { level, parentId, status, featured } = filters;
    console.log(level, parentId, status, featured ,"quearyparams");
  const page = filters.page !== undefined ? parseInt(filters.page, 10) : null;
  const limit = filters.limit !== undefined ? parseInt(filters.limit, 10) : null;

    let query = {};
    if (level !== undefined) query.level = level;
    if (parentId !== undefined) query.parentId = parentId;
    if (status) query.status = status;
    if (featured !== undefined) query.isFeatured = featured;

    let categoriesQuery = Category.find(query)
      .populate("parentId", "name slug")
      .sort({ createdAt: -1 });

    // Fix: Apply pagination if page and limit are not null
    if (page !== null && limit !== null) {
      const skip = (page - 1) * limit;
      categoriesQuery = categoriesQuery.skip(skip).limit(limit);
    }

    const categories = await categoriesQuery;
    const total = await Category.countDocuments(query);

    return {
      success: true,
      message: "Categories fetched successfully",
      total,
      count: categories.length,
      page: page || null,
      limit: limit || null,
      data: categories,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    };
  }
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