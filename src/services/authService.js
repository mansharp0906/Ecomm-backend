const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

const registerUser = async (userData) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create new user
    const user = new User(userData);
    await user.save();
    
    // Populate role details
    await user.populate('role', 'name permissions');
    
    // Generate token
    const token = generateToken(user._id);
    
    return {
      user,
      token
    };
  } catch (error) {
    throw error;
  }
};

const loginUser = async (email, password) => {
  try {
    // Find user and include password for comparison
    const user = await User.findOne({ email })
      .select('+password')
      .populate('role', 'name permissions');
    
    if (!user || user.status !== 'active') {
      throw new Error('Invalid credentials or account inactive');
    }
    
    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      throw new Error('Invalid credentials');
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    // Remove password from user object
    user.password = undefined;
    
    return {
      user,
      token
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateToken,
  registerUser,
  loginUser
};