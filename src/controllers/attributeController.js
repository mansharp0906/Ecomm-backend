
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