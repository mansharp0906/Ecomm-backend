const Attribute = require('../models/Attribute');

const createAttribute = async (attributeData) => {
  const attribute = new Attribute(attributeData);
  return await attribute.save();
};

const getAttributeById = async (id) => {
  return await Attribute.findById(id).populate('categories', 'name slug');
};

const getAttributeBySlug = async (slug) => {
  return await Attribute.findOne({ slug }).populate('categories', 'name slug');
};

const getAllAttributes = async (filters = {}) => {
  const { category, isFilterable, status } = filters;
  let query = {};
  
  if (category) query.categories = category;
  if (isFilterable !== undefined) query.isFilterable = isFilterable;
  if (status) query.status = status;
  
  return await Attribute.find(query).populate('categories', 'name slug');
};

const getAttributesByCategory = async (categoryId) => {
  return await Attribute.find({ 
    categories: categoryId, 
    status: 'active' 
  }).populate('categories', 'name slug');
};

const updateAttribute = async (id, updateData) => {
  return await Attribute.findByIdAndUpdate(id, updateData, { 
    new: true, 
    runValidators: true 
  });
};

const deleteAttribute = async (id) => {
  return await Attribute.findByIdAndDelete(id);
};

module.exports = {
  createAttribute,
  getAttributeById,
  getAttributeBySlug,
  getAllAttributes,
  getAttributesByCategory,
  updateAttribute,
  deleteAttribute
};