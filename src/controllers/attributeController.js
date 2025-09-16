// const { validationResult } = require('express-validator');
// const Attribute = require('../models/Attribute');

// // Create a new attribute
// exports.createAttribute = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: errors.array()
//       });
//     }

//     const { name, values, isFilterable, isRequired, status } = req.body;
    
//     const attribute = new Attribute({
//       name,
//       values: values || [],
//       isFilterable: isFilterable || false,
//       isRequired: isRequired || false,
//       status: status || 'active'
//     });

//     await attribute.save();
    
//     res.status(201).json({
//       success: true,
//       message: 'Attribute created successfully',
//       data: { attribute }
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: 'Attribute with this name already exists'
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // Get all attributes with filtering and pagination
// exports.getAttributes = async (req, res) => {
//   try {
//     const { 
//       page = 1, 
//       limit = 50, 
//       search, 
//       status,
//       isFilterable 
//     } = req.query;
    
//     let query = {};
    
//     if (status) {
//       query.status = status;
//     }
    
//     if (isFilterable !== undefined) {
//       query.isFilterable = isFilterable === 'true';
//     }
    
//     if (search) {
//       query.name = { $regex: search, $options: 'i' };
//     }
    
//     const attributes = await Attribute.find(query)
//       .sort({ name: 1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);
    
//     const total = await Attribute.countDocuments(query);
    
//     res.json({
//       success: true,
//       data: {
//         attributes,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / limit)
//         }
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // Get single attribute
// exports.getAttribute = async (req, res) => {
//   try {
//     const attribute = await Attribute.findById(req.params.id);
    
//     if (!attribute) {
//       return res.status(404).json({
//         success: false,
//         message: 'Attribute not found'
//       });
//     }
    
//     res.json({
//       success: true,
//       data: { attribute }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // Update attribute
// exports.updateAttribute = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: errors.array()
//       });
//     }

//     const { name, values, isFilterable, isRequired, status } = req.body;
    
//     const attribute = await Attribute.findByIdAndUpdate(
//       req.params.id,
//       { name, values, isFilterable, isRequired, status },
//       { new: true, runValidators: true }
//     );
    
//     if (!attribute) {
//       return res.status(404).json({
//         success: false,
//         message: 'Attribute not found'
//       });
//     }
    
//     res.json({
//       success: true,
//       message: 'Attribute updated successfully',
//       data: { attribute }
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: 'Attribute with this name already exists'
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // Delete attribute
// exports.deleteAttribute = async (req, res) => {
//   try {
//     const attribute = await Attribute.findById(req.params.id);
    
//     if (!attribute) {
//       return res.status(404).json({
//         success: false,
//         message: 'Attribute not found'
//       });
//     }
    
//     // Check if attribute is used in any products
//     const Product = require('../models/Product');
//     const productCount = await Product.countDocuments({
//       $or: [
//         { 'attributes.attribute': req.params.id },
//         { 'variants.attributes.attribute': req.params.id }
//       ]
//     });
    
//     if (productCount > 0) {
//       return res.status(400).json({ 
//         success: false,
//         message: 'Cannot delete attribute that is used in products. Please remove it from products first.' 
//       });
//     }
    
//     await Attribute.findByIdAndDelete(req.params.id);
    
//     res.json({
//       success: true,
//       message: 'Attribute deleted successfully'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // Toggle attribute status
// exports.toggleAttributeStatus = async (req, res) => {
//   try {
//     const attribute = await Attribute.findById(req.params.id);
    
//     if (!attribute) {
//       return res.status(404).json({
//         success: false,
//         message: 'Attribute not found'
//       });
//     }
    
//     attribute.status = attribute.status === 'active' ? 'inactive' : 'active';
//     await attribute.save();
    
//     res.json({
//       success: true,
//       message: `Attribute ${attribute.status === 'active' ? 'activated' : 'deactivated'} successfully`,
//       data: { attribute }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };
const { default: slugify } = require('slugify');
const attributeService = require('../services/attributeService');
const { validateAttribute } = require('../validations/attributeValidation');

const createAttribute = async (req, res) => {
  try {
    const { error } = validateAttribute(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
     const slug = slugify(req.body.name, { lower: true, strict: true });

    const attributeData = {
      ...req.body,
      slug
    };
    const attribute = await attributeService.createAttribute(attributeData);
    res.status(201).json(attribute);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAttribute = async (req, res) => {
  try {
    const { id } = req.params;
    const attribute = await attributeService.getAttributeById(id);
    
    if (!attribute) {
      return res.status(404).json({ error: 'Attribute not found' });
    }
    
    res.json(attribute);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAttributeBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const attribute = await attributeService.getAttributeBySlug(slug);
    
    if (!attribute) {
      return res.status(404).json({ error: 'Attribute not found' });
    }
    
    res.json(attribute);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllAttributes = async (req, res) => {
  try {
    const filters = req.query;
    const attributes = await attributeService.getAllAttributes(filters);
    res.json(attributes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAttributesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const attributes = await attributeService.getAttributesByCategory(categoryId);
    res.json(attributes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateAttribute = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = validateAttribute(req.body, true);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const attribute = await attributeService.updateAttribute(id, req.body);
    
    if (!attribute) {
      return res.status(404).json({ error: 'Attribute not found' });
    }
    
    res.json(attribute);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteAttribute = async (req, res) => {
  try {
    const { id } = req.params;
    const attribute = await attributeService.deleteAttribute(id);
    
    if (!attribute) {
      return res.status(404).json({ error: 'Attribute not found' });
    }
    
    res.json({ message: 'Attribute deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createAttribute,
  getAttribute,
  getAttributeBySlug,
  getAllAttributes,
  getAttributesByCategory,
  updateAttribute,
  deleteAttribute
};