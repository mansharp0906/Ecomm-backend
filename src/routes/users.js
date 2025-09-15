const express = require('express');
const { getAllUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');
const { auth, requireRole, requirePermission } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { createUserValidation, updateUserValidation } = require('../validations/userValidation');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Only admin can manage users
router.get('/', requireRole(['admin']), getAllUsers);
router.get('/:id', requirePermission('user.read'), getUser);
router.put('/:id', requirePermission('user.update'), updateUserValidation, handleValidationErrors, updateUser);
router.delete('/:id', requireRole(['admin']), deleteUser);

module.exports = router;