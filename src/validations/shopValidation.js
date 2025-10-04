const Joi = require('joi');

const addressSchema = Joi.object({
  street: Joi.string().trim().allow(''),
  city: Joi.string().trim().allow(''),
  state: Joi.string().trim().allow(''),
  country: Joi.string().trim().allow(''),
  zipCode: Joi.string().trim().allow('')
});

const contactSchema = Joi.object({
  email: Joi.string().email().allow(''),
  phone: Joi.string().trim().allow(''),
  address: addressSchema
});

const socialMediaSchema = Joi.object({
  website: Joi.string().uri().allow(''),
  facebook: Joi.string().uri().allow(''),
  instagram: Joi.string().uri().allow(''),
  twitter: Joi.string().uri().allow('')
});

const settingsSchema = Joi.object({
  commissionRate: Joi.number().min(0).max(100).default(10),
  autoApproveProducts: Joi.boolean().default(false)
});

const validateShop = (data, isUpdate = false) => {
  const schema = Joi.object({
    name: isUpdate ? 
      Joi.string().trim().max(100) : 
      Joi.string().trim().max(100).required(),
    description: Joi.string().trim().allow(''),
    slug: isUpdate 
      ? Joi.string().trim().lowercase()
      : Joi.string().trim().lowercase().required(), // ✅ added
    contact: contactSchema,
    socialMedia: socialMediaSchema,
    settings: settingsSchema,
     logo: Joi.string().uri().allow('').optional(),     // ✅ added
    banner: Joi.string().uri().allow('').optional(),   // ✅ added
  });

  return schema.validate(data);
};

module.exports = { validateShop };