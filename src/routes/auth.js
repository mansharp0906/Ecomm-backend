const express = require('express');
const { register, login, getMe, changePassword } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { registerValidation, loginValidation, changePasswordValidation } = require('../validations/authValidation');

const router = express.Router();

router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginValidation, handleValidationErrors, login);
router.get('/me', auth, getMe);
router.put('/change-password', auth, changePasswordValidation, handleValidationErrors, changePassword);

module.exports = router;