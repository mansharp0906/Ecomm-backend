const shopService = require('../services/shopService');
const { sendShopApprovedEmail, sendShopRejectedEmail } = require('../services/emailService');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const { validateShop } = require('../validations/shopValidation');

const createShop = async (req, res) => {
  try {
    const { error } = validateShop(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    let logoUrl = req.body.logo || null;
    let bannerUrl = req.body.banner || null;

    

    const shopData = {
      ...req.body,
      owner: req.user._id,
      logo: logoUrl,
      banner: bannerUrl
    };

    const shop = await shopService.createShop(shopData);

    res.status(201).json({
      success: true,
      message: 'Shop created successfully. Waiting for admin approval.',
      data: { shop }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getShop = async (req, res) => {
  try {
    const shop = await shopService.getShopById(req.params.id);
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    res.json({
      success: true,
      data: { shop }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getMyShops = async (req, res) => {
  try {
    const shops = await shopService.getVendorShops(req.user._id);
    
    res.json({
      success: true,
      data: { shops }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getAllShops = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (search) filters.search = search;

    const result = await shopService.getAllShops(filters, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      data: {
        shops: result.shops,
        pagination: result.pagination
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateShopStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    const shop = await shopService.updateShopStatus(
      req.params.id, 
      status, 
      req.user._id, 
      rejectionReason
    );

    // Send email notification
    try {
      const User = require('../models/User');
      const vendor = await User.findById(shop.owner);
      
      if (status === 'approved') {
        await sendShopApprovedEmail(shop, vendor);
      } else if (status === 'rejected') {
        await sendShopRejectedEmail(shop, vendor, rejectionReason);
      }
    } catch (emailError) {
      console.error('Failed to send status email:', emailError);
    }

    res.json({
      success: true,
      message: `Shop ${status} successfully`,
      data: { shop }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateShop = async (req, res) => {
  try {
    const { error } = validateShop(req.body, true);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if user owns the shop
    const shop = await shopService.getShopById(req.params.id);
    if (!shop || shop.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this shop.'
      });
    }

    let updateData = { ...req.body };
      
    // if (req.files?.logo) {
    //   const logoUrl = await uploadToCloudinary(req.files.logo[0], 'shops/logo');
    //   updateData.logo = logoUrl;
    // }

    // if (req.files?.banner) {
    //   const bannerUrl = await uploadToCloudinary(req.files.banner[0], 'shops/banner');
    //   updateData.banner = bannerUrl;
    // }

    const updatedShop = await shopService.updateShop(req.params.id, updateData);

    res.json({
      success: true,
      message: 'Shop updated successfully',
      data: { shop: updatedShop }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createShop,
  getShop,
  getMyShops,
  getAllShops,
  updateShopStatus,
  updateShop
};