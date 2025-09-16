const Joi = require('joi');

const validateCategory = (data, isUpdate = false) => {
  const schema = Joi.object({
    name: isUpdate ? 
      Joi.string().trim().max(100) : 
      Joi.string().trim().max(100).required(),
    description: Joi.string().trim().allow(''),
    parentId: Joi.string().allow(null),
    priority: Joi.number().default(0),
    status: Joi.string().valid('active', 'inactive').default('active'),
    isFeatured: Joi.boolean().default(false),
    metaTitle: Joi.string().trim().allow(''),
    metaDescription: Joi.string().trim().allow('')
  });

  return schema.validate(data);
};

module.exports = { validateCategory };