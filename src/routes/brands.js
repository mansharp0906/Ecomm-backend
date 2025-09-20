
const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { auth, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', brandController.getAllBrands);
router.get('/:id', brandController.getBrand);
router.get('/slug/:slug', brandController.getBrandBySlug);
router.get('/:id/products', brandController.getBrandProducts);

// Admin routes
router.post('/', auth,  requireRole(['admin']), upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), brandController.createBrand);

router.put('/:id', auth,  requireRole(['admin']), upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), brandController.updateBrand);
router.delete('/:id', auth,  requireRole(['admin']), brandController.deleteBrand);

module.exports = router;