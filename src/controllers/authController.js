// const { validationResult } = require('express-validator');
// const authService = require('../services/authService');
// const { ROLES } = require('../config/constants');

// const register = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: errors.array()
//       });
//     }

//     const { name, email, password, role } = req.body;
    
//     const result = await authService.registerUser({
//       name,
//       email,
//       password,
//        role: role || ROLES.CUSTOMER  //default role is CUSTOMER
//     });
    
//     res.status(201).json({
//       success: true,
//       message: 'User registered successfully',
//       data: {
//         user: result.user,
//         token: result.token
//       }
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// const login = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: errors.array()
//       });
//     }

//     const { email, password } = req.body;
    
//     const result = await authService.loginUser(email, password);
    
//     res.json({
//       success: true,
//       message: 'Login successful',
//       data: {
//         user: result.user,
//         token: result.token
//       }
//     });
//   } catch (error) {
//     res.status(401).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// const getMe = async (req, res) => {
//   try {
//     res.json({
//       success: true,
//       data: {
//         user: req.user
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// };

// const changePassword = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: errors.array()
//       });
//     }

//     const { currentPassword, newPassword } = req.body;
//     const user = await User.findById(req.user._id).select('+password');
    
//     // Verify current password
//     const isMatch = await user.comparePassword(currentPassword);
//     if (!isMatch) {
//       return res.status(400).json({
//         success: false,
//         message: 'Current password is incorrect'
//       });
//     }
    
//     // Update password
//     user.password = newPassword;
//     await user.save();
    
//     res.json({
//       success: true,
//       message: 'Password updated successfully'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// };

// module.exports = {
//   register,
//   login,
//   getMe,
//   changePassword
// };

const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const User = require('../models/User');
const { ROLES } = require('../config/constants');

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, role } = req.body;
    
    const result = await authService.registerUser({
      name,
      email,
      password,
      role: role || ROLES.CUSTOMER  // default role is CUSTOMER
    });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        token: result.token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    
    const result = await authService.loginUser(email, password);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        token: result.token
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const logout = async (req, res) => {
  try {
    // For JWT tokens, we can't invalidate them on the server side without storing them
    // So we'll implement a simple token blacklist or rely on client-side token removal
    
    // Option 1: Store blacklisted tokens in memory (for simple implementation)
    // In production, you might want to use Redis for this
    
    // Option 2: Use refresh tokens and revoke them (more advanced)
    
    // For now, we'll just return success and let the client remove the token
    res.json({
      success: true,
      message: 'Logout successful. Please remove the token from client storage.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// Advanced logout with token blacklisting (if you want to implement it)
let tokenBlacklist = new Set();

const logoutWithBlacklist = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      // Add token to blacklist
      tokenBlacklist.add(token);
      
      // Set a timeout to remove the token from blacklist after it expires
      // This is optional but helps manage memory
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        const expiresIn = decoded.exp * 1000 - Date.now();
        setTimeout(() => {
          tokenBlacklist.delete(token);
        }, expiresIn);
      }
    }
    
    res.json({
      success: true,
      message: 'Logout successful. Token has been invalidated.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// Middleware to check if token is blacklisted
const checkTokenBlacklist = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token && tokenBlacklist.has(token)) {
    return res.status(401).json({
      success: false,
      message: 'Token has been invalidated. Please login again.'
    });
  }
  
  next();
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  logout,
  logoutWithBlacklist,
  checkTokenBlacklist
};