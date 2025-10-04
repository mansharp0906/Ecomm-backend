const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { auth, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Vendor routes
router.post('/', auth, requireRole(['vendor']), upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), shopController.createShop);

router.get('/my-shops', auth, requireRole(['vendor']), shopController.getMyShops);

// Public routes
router.get('/:id', shopController.getShop);

// Admin routes
router.get('/', auth, requireRole(['admin', 'manager']), shopController.getAllShops);
router.put('/:id/status', auth, requireRole(['admin', 'manager']), shopController.updateShopStatus);

module.exports = router;