
const express = require('express');
const router = express.Router();
const attributeController = require('../controllers/attributeController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', attributeController.getAllAttributes);
router.get('/category/:categoryId', attributeController.getAttributesByCategory);
router.get('/:id', attributeController.getAttribute);
router.get('/slug/:slug', attributeController.getAttributeBySlug);

// Admin routes
router.post('/', auth, requireRole(['admin']), attributeController.createAttribute);
router.put('/:id', auth, requireRole(['admin']), attributeController.updateAttribute);
router.delete('/:id', auth, requireRole(['admin']), attributeController.deleteAttribute);

module.exports = router;