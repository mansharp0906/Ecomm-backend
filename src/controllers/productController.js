
const { default: slugify } = require('slugify');
const productService = require('../services/productService');
const { uploadToCloudinary, uploadMultipleToCloudinary } = require('../utils/cloudinaryUpload');
const { validateProduct } = require('../validations/productValidation');

// const createProduct = async (req, res) => {
//   try {
//     console.log(req.body, "body in products");

//     // ✅ Validation
//     const { error } = validateProduct(req.body);
//     if (error) {
//       return res.status(400).json({ error: error.details[0].message });
//     }

//     let thumbnailUrl = null;
//     let imageUrls = [];
//     let pdfUrl = null;
    
//     // ✅ Upload files if available
//     if (req.files?.thumbnail?.[0]) {
//       thumbnailUrl = await uploadToCloudinary(req.files.thumbnail[0], "products/thumbnail");
//     }

//     if (req.files?.images?.length) {
//       imageUrls = await uploadMultipleToCloudinary(req.files.images, "products/images");
//     }

//     if (req.files?.pdf?.[0]) {
//       pdfUrl = await uploadToCloudinary(req.files.pdf[0], "products/pdf");
//     }

//     // ✅ Start preparing product data
//     const productData = {
//       ...req.body,
//       thumbnail: thumbnailUrl,
//       images: imageUrls,
//       pdf: pdfUrl,
//     };

//     // ✅ Safe JSON parsing (in case values are sent as strings)
//     const parseIfString = (field) => {
//       if (typeof req.body[field] === "string") {
//         try {
//           return JSON.parse(req.body[field]);
//         } catch (err) {
//           console.warn(`Invalid JSON for field: ${field}`);
//           return req.body[field]; // fallback to raw value
//         }
//       }
//       return req.body[field];
//     };

//     productData.variants = parseIfString("variants");
//     productData.attributes = parseIfString("attributes");
//     productData.dimensions = parseIfString("dimensions");
//     productData.storeVisibility = parseIfString("storeVisibility");

//     // ✅ Save product
//     const product = await productService.createProduct(productData);
//     return res.status(201).json(product);
//   } catch (error) {
//     console.error("Error creating product:", error);
//     return res.status(400).json({ error: error.message });
//   }
// };


const createProduct = async (req, res) => {
  try {


    let thumbnailUrl = null;
    let imageUrls = [];
    let pdfUrl = null;

    // ✅ Upload files if available
    if (req.files?.thumbnail?.[0]) {
      thumbnailUrl = await uploadToCloudinary(
        req.files.thumbnail[0],
        "products/thumbnail"
      );
    }

    if (req.files?.images?.length) {
      imageUrls = await uploadMultipleToCloudinary(
        req.files.images,
        "products/images"
      );
    }
    if (req.files?.pdf?.[0]) {
      pdfUrl = await uploadToCloudinary(
        req.files.pdf[0],
        "products/pdf"
      );
    }
    // ✅ Generate slug from title
    const slug = slugify(req.body.title, { lower: true, strict: true });

    // ✅ Prepare product data
    const productData = {
      ...req.body,
      slug,
      thumbnail: thumbnailUrl,
      images: imageUrls,
      pdf: pdfUrl,
    };

    // ✅ Safe JSON parsing helper
    const parseIfString = (field) => {
      if (typeof req.body[field] === "string") {
        try {
          return JSON.parse(req.body[field]);
        } catch (err) {
          console.warn(`Invalid JSON for field: ${field}`);
          return req.body[field];
        }
      }
      return req.body[field];
    };

    productData.variants = parseIfString("variants");
    productData.attributes = parseIfString("attributes");
    productData.dimensions = parseIfString("dimensions");
    productData.storeVisibility = parseIfString("storeVisibility");

    // ✅ Normalize numeric and array fields
    // if (req.body.weight) {
    //   productData.weight = Array.isArray(req.body.weight)
    //     ? req.body.weight.map(Number)
    //     : Number(req.body.weight);
    // }
    if (req.body.weight) {
  productData.weight = Number(
    Array.isArray(req.body.weight) ? req.body.weight[0] : req.body.weight
  );
}


    if (req.body.stock) {
      productData.stock = Array.isArray(req.body.stock)
        ? req.body.stock.map(Number)
        : Number(req.body.stock);
    }

    if (req.body.tags) {
      productData.tags = Array.isArray(req.body.tags)
        ? req.body.tags
        : [req.body.tags];
    }
   console.log(req.body.sku, "sku in product controller");
    if (req.body.sku) {
      productData.sku = Array.isArray(req.body.sku)
        ? req.body.sku
        : req.body.sku.toString();
    }

    // ✅ Trim ObjectId fields to avoid Mongo Cast errors
    if (req.body.category) productData.category = req.body.category.trim();
    if (req.body.subCategory) productData.subCategory = req.body.subCategory.trim();
    if (req.body.brand) productData.brand = req.body.brand.trim();

    // ✅ Validate product
    const { error } = validateProduct(productData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // ✅ Save product
    const product = await productService.createProduct(productData);
    return res.status(201).json(product);

  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(400).json({ error: error.message });
  }
};


const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const filters = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort ? JSON.parse(req.query.sort) : {};
    
    const result = await productService.getAllProducts(filters, page, limit, sort);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = validateProduct(req.body, true);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    let updateData = { ...req.body };
    
    if (req.files?.thumbnail) {
      const thumbnailUrl = await uploadToCloudinary(req.files.thumbnail[0], 'products/thumbnail');
      updateData.thumbnail = thumbnailUrl;
    }
    
    if (req.files?.images) {
      const imageUrls = await uploadMultipleToCloudinary(req.files.images, 'products/images');
      updateData.images = imageUrls;
    }
    
    if (req.files?.pdf) {
      const pdfUrl = await uploadToCloudinary(req.files.pdf[0], 'products/pdf');
      updateData.pdf = pdfUrl;
    }
    
    // Parse JSON fields if they are sent as strings
    if (typeof req.body.variants === 'string') {
      updateData.variants = JSON.parse(req.body.variants);
    }
    
    if (typeof req.body.attributes === 'string') {
      updateData.attributes = JSON.parse(req.body.attributes);
    }
    
    if (typeof req.body.dimensions === 'string') {
      updateData.dimensions = JSON.parse(req.body.dimensions);
    }
    
    if (typeof req.body.storeVisibility === 'string') {
      updateData.storeVisibility = JSON.parse(req.body.storeVisibility);
    }
    
    const product = await productService.updateProduct(id, updateData);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.deleteProduct(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await productService.getFeaturedProducts(limit);
    res.json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 5;
    
    // First get the product to find its category
    const product = await productService.getProductById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const relatedProducts = await productService.getRelatedProducts(
      id, 
      product.category, 
      limit
    );
    
    res.json(relatedProducts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createProduct,
  getProduct,
  getProductBySlug,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getRelatedProducts
};