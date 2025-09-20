// const User = require('../models/User');

// const getAllUsers = async (filters = {}, page = 1, limit = 10) => {
//   try {
//     const skip = (page - 1) * limit;
    
//     const query = {};
    
//     // Apply filters
//     if (filters.role) {
//       query.role = filters.role;
//     }
    
//     if (filters.status) {
//       query.status = filters.status;
//     }
    
//     if (filters.search) {
//       query.$or = [
//         { name: { $regex: filters.search, $options: 'i' } },
//         { email: { $regex: filters.search, $options: 'i' } }
//       ];
//     }
    
//     const users = await User.find(query)
//       .populate('role', 'name permissions')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);
    
//     const total = await User.countDocuments(query);
    
//     return {
//       users,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit)
//       }
//     };
//   } catch (error) {
//     throw error;
//   }
// };

// const getUserById = async (userId) => {
//   try {
//     const user = await User.findById(userId).populate('role', 'name permissions');
//     if (!user) {
//       throw new Error('User not found');
//     }
//     return user;
//   } catch (error) {
//     throw error;
//   }
// };

// const updateUser = async (userId, updateData) => {
//   try {
//     const user = await User.findByIdAndUpdate(
//       userId,
//       updateData,
//       { new: true, runValidators: true }
//     ).populate('role', 'name permissions');
    
//     if (!user) {
//       throw new Error('User not found');
//     }
    
//     return user;
//   } catch (error) {
//     throw error;
//   }
// };

// const deleteUser = async (userId) => {
//   try {
//     const user = await User.findByIdAndDelete(userId);
//     if (!user) {
//       throw new Error('User not found');
//     }
//     return user;
//   } catch (error) {
//     throw error;
//   }
// };

// module.exports = {
//   getAllUsers,
//   getUserById,
//   updateUser,
//   deleteUser
// };
const User = require('../models/User');

const getAllUsers = async (filters = {}, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    const query = {};
    
    // Apply filters
    if (filters.role) {
      query.role = filters.role;
    }
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(query);
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    throw error;
  }
};

const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email }).select('+password');
    return user;
  } catch (error) {
    throw error;
  }
};

const updateUser = async (userId, updateData) => {
  try {
    // Remove password from update data if present
    const { password, ...safeUpdateData } = updateData;
    
    const user = await User.findByIdAndUpdate(
      userId,
      safeUpdateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    throw error;
  }
};

const createUser = async (userData) => {
  try {
    const user = new User(userData);
    await user.save();
    return user.toObject();
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  createUser
};