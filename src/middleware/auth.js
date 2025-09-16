const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('role', 'name permissions');
    
    if (!user || user.status !== 'active') {
      return res.status(401).json({ 
        success: false,
        message: 'Token is not valid or user is inactive.' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid.' 
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    console.log(req.user.role,"user role");
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    const userPermissions = [...req.user.permissions, ...req.user.role.permissions];
    console.log(userPermissions,"permissions")
    if (!userPermissions.includes(permission) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

module.exports = { auth, requireRole, requirePermission };