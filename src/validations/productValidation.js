const Joi = require('joi');

const variantSchema = Joi.object({
  sku: Joi.string().required(),
  price: Joi.number().min(0).required(),
  mrp: Joi.number().min(0).required(),
  weight: Joi.number().min(0).default(0),
  stock: Joi.number().default(0),
  images: Joi.array().items(Joi.string()),
  attributes: Joi.array().items(Joi.object({
    attribute: Joi.string().required(),
    value: Joi.string().required()
  })),
  status: Joi.string().valid('active', 'inactive').default('active')
});

const productAttributeSchema = Joi.object({
  attribute: Joi.string().required(),
  values: Joi.array().items(Joi.string()).min(1)
});

const storeVisibilitySchema = Joi.object({
  store: Joi.string().required(),
  // stock: Joi.number().default(0),
  stock: Joi.alternatives().try(
  Joi.number(),
  Joi.array().items(Joi.number())
).default(0),

  threshold: Joi.number().default(5),
  visible: Joi.boolean().default(true)
});

const dimensionsSchema = Joi.object({
  length: Joi.number().min(0),
  width: Joi.number().min(0),
  height: Joi.number().min(0)
});

const validateProduct = (data, isUpdate = false) => {
  const schema = Joi.object({
    title: isUpdate ? 
      Joi.string().trim().max(200) : 
      Joi.string().trim().max(200).required(),
    description: Joi.string().trim().allow(''),
    shortDescription: Joi.string().trim().max(300).allow(''),
    sku: Joi.string().allow(''),
    barcode: Joi.string().allow(''),
    brand: Joi.string().allow(null),
    category: isUpdate ? 
      Joi.string() : 
      Joi.string().required(),
    subCategory: Joi.string().allow(null),
    variants: Joi.array().items(variantSchema),
    attributes: Joi.array().items(productAttributeSchema),
    images: Joi.array().items(Joi.string()),
    thumbnail: isUpdate ? 
      Joi.string() : 
      Joi.string().required(),
    type: Joi.string().valid('physical', 'digital').default('physical'),
    unit: Joi.string().default('pcs'),
    minOrderQty: Joi.number().min(1).default(1),
    tax: Joi.number().min(0).default(0),
    taxType: Joi.string().valid('inclusive', 'exclusive').default('exclusive'),
    shippingCost: Joi.number().min(0).default(0),
    // weight: Joi.number().min(0).default(0),
    weight: Joi.alternatives().try(
  Joi.number(),
  Joi.array().items(Joi.number())
).default(0),


tags: Joi.alternatives().try(
  Joi.string(),
  Joi.array().items(Joi.string())
),

    dimensions: dimensionsSchema,
    storeVisibility: Joi.array().items(storeVisibilitySchema),
    status: Joi.string().valid('active', 'inactive', 'draft').default('draft'),
    featured: Joi.boolean().default(false),
    metaTitle: Joi.string().trim().allow(''),
    metaDescription: Joi.string().trim().allow(''),
    pdf: Joi.string().allow(null, ''),
    // tags: Joi.array().items(Joi.string()),
    createdBy: Joi.string()
  });

  // return schema.validate(data);
   return schema.validate(data, { stripUnknown: true });
};

module.exports = { validateProduct };