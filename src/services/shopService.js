const Shop = require('../models/Shop');
const User = require('../models/User');
const Product = require('../models/Product');

const createShop = async (shopData) => {
  try {
    const shop = new Shop(shopData);
    await shop.save();
    
    // Add shop to user's shops array
    await User.findByIdAndUpdate(shopData.owner, {
      $push: { shops: shop._id }
    });
    
    return shop;
  } catch (error) {
    throw error;
  }
};

const getShopById = async (shopId) => {
  return await Shop.findById(shopId)
    .populate('owner', 'name email')
    .populate('approvedBy', 'name');
};

const getShopBySlug = async (slug) => {
  return await Shop.findOne({ slug })
    .populate('owner', 'name email')
    .populate('approvedBy', 'name');
};

const getVendorShops = async (vendorId) => {
  return await Shop.find({ owner: vendorId })
    .populate('owner', 'name email')
    .sort({ createdAt: -1 });
};

const getAllShops = async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  let query = {};
  
  if (filters.status) query.status = filters.status;
  if (filters.search) {
    query.name = { $regex: filters.search, $options: 'i' };
  }
  
  const shops = await Shop.find(query)
    .populate('owner', 'name email')
    .populate('approvedBy', 'name')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  const total = await Shop.countDocuments(query);
  
  return {
    shops,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const updateShopStatus = async (shopId, status, approvedBy = null, rejectionReason = '') => {
  const updateData = { status };
  
  if (status === 'approved') {
    updateData.approvedAt = new Date();
    updateData.approvedBy = approvedBy;
    updateData.isActive = true;
  } else if (status === 'rejected') {
    updateData.rejectionReason = rejectionReason;
    updateData.isActive = false;
  } else if (status === 'suspended') {
    updateData.isActive = false;
  }
  
  const shop = await Shop.findByIdAndUpdate(shopId, updateData, { new: true });
  
  if (!shop) {
    throw new Error('Shop not found');
  }
  
  return shop;
};

const updateShopStats = async (shopId) => {
  const stats = await Product.aggregate([
    { $match: { shop: shopId } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: {
          $sum: {
            $cond: [{ $eq: ['$approvalStatus', 'approved'] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  const shopStats = stats[0] || { totalProducts: 0, activeProducts: 0 };
  
  await Shop.findByIdAndUpdate(shopId, {
    $set: {
      'stats.totalProducts': shopStats.totalProducts,
      'stats.activeProducts': shopStats.activeProducts
    }
  });
};

module.exports = {
  createShop,
  getShopById,
  getShopBySlug,
  getVendorShops,
  getAllShops,
  updateShopStatus,
  updateShopStats
};