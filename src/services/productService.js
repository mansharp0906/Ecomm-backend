const Product = require('../models/Product');
const Shop = require('../models/Shop');
const { sendProductApprovalEmail, sendProductRejectionEmail } = require('./emailService');


// const createProduct = async (productData) => {
//   const product = new Product(productData);
//   return await product.save();
// };
const createProduct = async (productData) => {
  try {
    // Check if vendor owns the shop
    const shop = await Shop.findOne({ 
      _id: productData.shop, 
      owner: productData.vendor 
    });
    
    if (!shop) {
      throw new Error('Shop not found or you do not own this shop');
    }
    
    if (shop.status !== 'approved') {
      throw new Error('Shop must be approved to add products');
    }
    
    // Set approval status based on shop settings
    if (shop.settings.autoApproveProducts) {
      productData.approvalStatus = 'approved';
      productData.approvedAt = new Date();
      productData.isListed = true;
    } else {
      productData.approvalStatus = 'pending';
      productData.isListed = false;
    }
    
    const product = new Product(productData);
    await product.save();
    
    // Update shop stats
    await updateShopStats(productData.shop);
    
    return product;
  } catch (error) {
    throw error;
  }
};

// Add product approval functions
const approveProduct = async (productId, approvedBy) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    {
      approvalStatus: 'approved',
      approvedAt: new Date(),
      approvedBy: approvedBy,
      isListed: true,
      rejectionReason: null
    },
    { new: true }
  ).populate('vendor', 'name email').populate('shop');
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Send approval email
  try {
    await sendProductApprovalEmail(product);
  } catch (emailError) {
    console.error('Failed to send approval email:', emailError);
  }
  
  // Update shop stats
  await updateShopStats(product.shop._id);
  
  return product;
};

const rejectProduct = async (productId, rejectedBy, rejectionReason) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    {
      approvalStatus: 'rejected',
      isListed: false,
      rejectionReason: rejectionReason
    },
    { new: true }
  ).populate('vendor', 'name email').populate('shop');
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Send rejection email
  try {
    await sendProductRejectionEmail(product, rejectionReason);
  } catch (emailError) {
    console.error('Failed to send rejection email:', emailError);
  }
  
  // Update shop stats
  await updateShopStats(product.shop._id);
  
  return product;
};

// Update getAllProducts to handle vendor filtering
const getAllProducts = async (filters = {}, page = 1, limit = 10, sort = {}) => {
  const skip = (page - 1) * limit;
  
  let query = {};
  
  // Apply filters
  if (filters.category) query.category = filters.category;
  if (filters.brand) query.brand = filters.brand;
  if (filters.status) query.status = filters.status;
  if (filters.featured !== undefined) query.featured = filters.featured;
  if (filters.vendor) query.vendor = filters.vendor;
  if (filters.shop) query.shop = filters.shop;
  if (filters.approvalStatus) query.approvalStatus = filters.approvalStatus;
  
  // For customers, only show approved and listed products
  if (filters.customerView) {
    query.approvalStatus = 'approved';
    query.isListed = true;
    query.status = 'active';
  }
  
  if (filters.minPrice || filters.maxPrice) {
    query['variants.price'] = {};
    if (filters.minPrice) query['variants.price'].$gte = filters.minPrice;
    if (filters.maxPrice) query['variants.price'].$lte = filters.maxPrice;
  }
  
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
    .populate('vendor', 'name email')
    .populate('shop', 'name slug')
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

// Add function to get vendor's products
const getVendorProducts = async (vendorId, filters = {}, page = 1, limit = 10) => {
  filters.vendor = vendorId;
  return await getAllProducts(filters, page, limit);
};

// Helper function to update shop stats
const updateShopStats = async (shopId) => {
  const Shop = require('./shopService');
  await Shop.updateShopStats(shopId);
};


const getProductById = async (id) => {
  return await Product.findById(id)
    .populate('brand', 'name slug logo')
    .populate('category', 'name slug')
    .populate('subCategory', 'name slug')
    .populate('attributes.attribute', 'name slug displayType')
    .populate('variants.attributes.attribute', 'name slug displayType');
};

const getProductBySlug = async (slug) => {
  return await Product.findOne({ slug })
    .populate('brand', 'name slug logo')
    .populate('category', 'name slug')
    .populate('subCategory', 'name slug')
    .populate('attributes.attribute', 'name slug displayType')
    .populate('variants.attributes.attribute', 'name slug displayType');
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
  getRelatedProducts,
  approveProduct,
  rejectProduct,
  getVendorProducts
};