const Joi = require('joi');

const attributeValueSchema = Joi.object({
  value: Joi.string().trim().required(),
  color: Joi.string().trim().allow(null, ''),
  image: Joi.string().trim().allow(null, ''),
  isDefault: Joi.boolean().default(false)
});

const validateAttribute = (data, isUpdate = false) => {
  const schema = Joi.object({
    name: isUpdate ? 
      Joi.string().trim().max(100) : 
      Joi.string().trim().max(100).required(),
    values: Joi.array().items(attributeValueSchema),
    isFilterable: Joi.boolean().default(false),
    isRequired: Joi.boolean().default(false),
    displayType: Joi.string().valid('text', 'color', 'image').default('text'),
    status: Joi.string().valid('active', 'inactive').default('active'),
    categories: Joi.array().items(Joi.string())
  });

  return schema.validate(data);
};

module.exports = { validateAttribute };