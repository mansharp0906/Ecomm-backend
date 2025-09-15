const userService = require('../services/userService');

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    
    const filters = {};
    if (role) filters.role = role;
    if (status) filters.status = status;
    if (search) filters.search = search;
    
    const result = await userService.getAllUsers(filters, parseInt(page), parseInt(limit));
    
    res.json({
      success: true,
      data: {
        users: result.users,
        pagination: result.pagination
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    
    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await userService.updateUser(req.params.id, req.body);
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser
};