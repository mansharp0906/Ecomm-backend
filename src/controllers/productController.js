const { default: slugify } = require("slugify");
const productService = require("../services/productService");
const { validateProduct } = require("../validations/productValidation");

// const createProduct = async (req, res) => {
//   try {
//     // ✅ Frontend should now send these URLs directly:
//     // thumbnail: string (Cloudinary URL)
//     // images: string[] (array of Cloudinary URLs)
//     // pdf: string (Cloudinary URL)

//     const {
//       thumbnail,
//       images,
//       pdf,
//       title,
//       variants,
//       attributes,
//       dimensions,
//       weight,
//       minOrderQty,
//       tax,
//       shippingCost,
//       tags,
//       category,
//       subCategory,
//       brand,
//     } = req.body;

//     // ✅ Generate slug from title
//     const slug = slugify(title, { lower: true, strict: true });

//     // ✅ Prepare product data directly from request body
//     const productData = {
//       ...req.body,
//       slug,
//       thumbnail, // already Cloudinary URL
//       images: Array.isArray(images) ? images : images ? [images] : [],
//       pdf,
//     };

//     // ✅ Parse JSON fields if sent as string
//     const parseIfString = (field) => {
//       if (typeof req.body[field] === "string") {
//         try {
//           return JSON.parse(req.body[field]);
//         } catch {
//           return req.body[field];
//         }
//       }
//       return req.body[field];
//     };

//     productData.variants = parseIfString("variants");
//     productData.attributes = parseIfString("attributes");
//     productData.dimensions = parseIfString("dimensions");

//     // ✅ Convert numeric fields
//     if (weight) productData.weight = Number(weight);
//     if (minOrderQty) productData.minOrderQty = Number(minOrderQty);
//     if (tax) productData.tax = Number(tax);
//     if (shippingCost) productData.shippingCost = Number(shippingCost);

//     // ✅ Tags normalization
//     if (tags) {
//       productData.tags = Array.isArray(tags) ? tags : [tags];
//     }

//     // ✅ Clean ObjectId fields
//     if (category) productData.category = category.trim();
//     if (subCategory) productData.subCategory = subCategory.trim();
//     if (brand) productData.brand = brand.trim();

//     // ✅ Validate product before saving
//     const { error } = validateProduct(productData);
//     if (error) {
//       return res.status(400).json({ error: error.details[0].message });
//     }

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
    // ✅ Frontend should now send these URLs directly:
    // thumbnail: string (Cloudinary URL)
    // images: string[] (array of Cloudinary URLs)
    // pdf: string (Cloudinary URL)

    const {
      thumbnail,
      images,
      pdf,
      title,
      variants,
      attributes,
      dimensions,
      weight,
      minOrderQty,
      tax,
      shippingCost,
      tags,
      category,
      subCategory,
      brand,
      price, // vendor price
    } = req.body;

    const vendorId = req.user?._id?.toString();

    // ✅ Generate slug from title
    const slug = slugify(title, { lower: true, strict: true });

    // ✅ Prepare product data directly from request body
    const productData = {
      ...req.body,
      slug,
      thumbnail, // already Cloudinary URL
      images: Array.isArray(images) ? images : images ? [images] : [],
      pdf,
      vendor: vendorId, // add vendor info from logged-in user
      vendorPrice: price, // store vendor's original price
    };

    // ✅ Helper to parse stringified JSON safely
    const parseIfString = (field) => {
      if (typeof req.body[field] === "string") {
        try {
          return JSON.parse(req.body[field]);
        } catch {
          return req.body[field];
        }
      }
      return req.body[field];
    };

    // ✅ Parse JSON fields if sent as string
    productData.variants = parseIfString("variants");
    productData.attributes = parseIfString("attributes");
    productData.dimensions = parseIfString("dimensions");

    // ✅ Convert numeric fields
    if (weight) productData.weight = Number(weight);
    if (minOrderQty) productData.minOrderQty = Number(minOrderQty);
    if (tax) productData.tax = Number(tax);
    if (shippingCost) productData.shippingCost = Number(shippingCost);

    // ✅ Normalize tags
    if (tags) {
      productData.tags = Array.isArray(tags) ? tags : [tags];
    }

    // ✅ Clean up ObjectId reference fields
    if (category) productData.category = category.trim();
    if (subCategory) productData.subCategory = subCategory.trim();
    if (brand) productData.brand = brand.trim();

    // ✅ Validate product before saving
    const { error } = validateProduct(productData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // ✅ Create product in DB
    const product = await productService.createProduct(productData);

    return res.status(201).json({
      success: true,
      message:
        product.approvalStatus === "approved"
          ? "Product created and listed successfully."
          : "Product created. Waiting for admin approval.",
      data: { product },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // ✅ Ensure images/thumbnail/pdf are direct URLs
    if (updateData.images && !Array.isArray(updateData.images)) {
      updateData.images = [updateData.images];
    }

    // ✅ Parse JSON fields
    ["variants", "attributes", "dimensions"].forEach((field) => {
      if (typeof req.body[field] === "string") {
        try {
          updateData[field] = JSON.parse(req.body[field]);
        } catch {
          updateData[field] = req.body[field];
        }
      }
    });

    const product = await productService.updateProduct(id, updateData);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const  getProduct=async (req, res) => {
    try {
      const product = await productService.getProductById(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  const getProductBySlug= async (req, res) => {
    try {
      const product = await productService.getProductBySlug(req.params.slug);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  const getAllProducts= async (req, res) => {
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
  }
 const  deleteProduct = async (req, res) => {
    try {
      const product = await productService.deleteProduct(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  const getFeaturedProducts = async (req, res) => {
  try {
    const products = await productService.getFeaturedProducts(); // you must implement this in service
    res.json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getRelatedProducts = async (req, res) => {
  try {
    const products = await productService.getRelatedProducts(req.params.id); // implement this too
    res.json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// Add new controller functions for product approval
const approveProduct = async (req, res) => {
  try {
    const product = await productService.approveProduct(req.params.id, req.user._id);
    
    res.json({
      success: true,
      message: 'Product approved successfully',
      data: { product }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const rejectProduct = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const product = await productService.rejectProduct(req.params.id, req.user._id, rejectionReason);
    
    res.json({
      success: true,
      message: 'Product rejected successfully',
      data: { product }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getVendorProducts = async (req, res) => {
  try {
    const filters = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await productService.getVendorProducts(req.user._id, filters, page, limit);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getAllProducts,
  getProduct,
  getProductBySlug,
  deleteProduct,
  getFeaturedProducts,
  getRelatedProducts,
   approveProduct,
  rejectProduct,
  getVendorProducts
};
  