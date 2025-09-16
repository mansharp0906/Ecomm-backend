const Joi = require('joi');

const validateBrand = (data, isUpdate = false) => {
  const schema = Joi.object({
    name: isUpdate ? 
      Joi.string().trim().max(100) : 
      Joi.string().trim().max(100).required(),
       logo: Joi.string().uri().allow(null),    
    banner: Joi.string().uri().allow(null),   
    description: Joi.string().trim().allow(''),
    status: Joi.string().valid('active', 'inactive').default('active'),
    priority: Joi.number().default(0),
    metaTitle: Joi.string().trim().allow(''),
    metaDescription: Joi.string().trim().allow('')
  });

  return schema.validate(data);
};

module.exports = { validateBrand };