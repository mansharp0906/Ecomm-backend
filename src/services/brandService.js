const Brand = require('../models/Brand');

const createBrand = async (brandData) => {
  const brand = new Brand(brandData);
  return await brand.save();
};

const getBrandById = async (id) => {
  return await Brand.findById(id);
};

const getBrandBySlug = async (slug) => {
  return await Brand.findOne({ slug });
};

const getAllBrands = async (filters = {}) => {
  const { status, featured } = filters;
  let query = {};
  
  if (status) query.status = status;
  if (featured !== undefined) query.featured = featured;
  
  return await Brand.find(query).sort({ priority: -1, name: 1 });
};

const updateBrand = async (id, updateData) => {
  return await Brand.findByIdAndUpdate(id, updateData, { 
    new: true, 
    runValidators: true 
  });
};

const deleteBrand = async (id) => {
  return await Brand.findByIdAndDelete(id);
};

const getBrandProducts = async (brandId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const products = await Product.find({ 
    brand: brandId, 
    status: 'active' 
  })
    .populate('category', 'name slug')
    .skip(skip)
    .limit(limit)
    .sort({ featured: -1, createdAt: -1 });
  
  const total = await Product.countDocuments({ brand: brandId, status: 'active' });
  
  return {
    products,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page
  };
};

module.exports = {
  createBrand,
  getBrandById,
  getBrandBySlug,
  getAllBrands,
  updateBrand,
  deleteBrand,
  getBrandProducts
};