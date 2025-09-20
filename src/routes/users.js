// const express = require('express');
// const { getAllUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');
// const { auth, requireRole, requirePermission } = require('../middleware/auth');
// const { handleValidationErrors } = require('../middleware/validation');
// const { createUserValidation, updateUserValidation } = require('../validations/userValidation');

// const router = express.Router();

// // All routes require authentication
// router.use(auth);

// // Only admin can manage users
// router.get('/', requireRole(['admin']), getAllUsers);
// router.get('/:id', requirePermission('user.read'), getUser);
// router.put('/:id', requirePermission('user.update'), updateUserValidation, handleValidationErrors, updateUser);
// router.delete('/:id', requireRole(['admin']), deleteUser);

// module.exports = router;
const express = require('express');
const { 
  getAllUsers, 
  getUser, 
  updateUser, 
  deleteUser,
  getUserProfile,
  updateUserProfile
} = require('../controllers/userController');
const { auth, requireRole, requirePermission } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { updateUserValidation } = require('../validations/userValidation');

const router = express.Router();

// Admin routes - require authentication and admin role
router.get('/', auth, requireRole(['admin']), getAllUsers);
router.get('/:id', auth, requirePermission('user.read'), getUser);
router.put('/:id', auth, requirePermission('user.update'), updateUserValidation, handleValidationErrors, updateUser);
router.delete('/:id', auth, requireRole(['admin']), deleteUser);

// User profile routes - require authentication
router.get('/profile/me', auth, getUserProfile);
router.put('/profile/me', auth, updateUserValidation, handleValidationErrors, updateUserProfile);

module.exports = router;