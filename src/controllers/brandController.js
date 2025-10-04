const { default: slugify } = require('slugify');
const brandService = require('../services/brandService');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const { validateBrand } = require('../validations/brandValidation');

const createBrand = async (req, res) => {
  try {
    const { error } = validateBrand(req.body);
    console.log(req.body,"body in brands");
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    let logoUrl = req.body.logo || null;
    let bannerUrl = req.body.banner || null;
    
    // if (req.files?.logo) {
    //   logoUrl = await uploadToCloudinary(req.files.logo[0], 'brands/logo');
    // }
    
    // if (req.files?.banner) {
    //   bannerUrl = await uploadToCloudinary(req.files.banner[0], 'brands/banner');
    // }
     
    const slug = slugify(req.body.name, { lower: true, strict: true });
    
    const brandData = {
      ...req.body,
       slug,
      logo: logoUrl,
      banner: bannerUrl
    };
    
    const brand = await brandService.createBrand(brandData);
    res.status(201).json(brand);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await brandService.getBrandById(id);
    
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json(brand);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getBrandBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const brand = await brandService.getBrandBySlug(slug);
    
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json(brand);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllBrands = async (req, res) => {
  try {
    const filters = req.query;
    const brands = await brandService.getAllBrands(filters);
    res.json(brands);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = validateBrand(req.body, true);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    let updateData = { ...req.body };
    
    // if (req.files?.logo) {
    //   const logoUrl = await uploadToCloudinary(req.files.logo[0], 'brands/logo');
    //   updateData.logo = logoUrl;
    // }
    
    // if (req.files?.banner) {
    //   const bannerUrl = await uploadToCloudinary(req.files.banner[0], 'brands/banner');
    //   updateData.banner = bannerUrl;
    // }
    
    const brand = await brandService.updateBrand(id, updateData);
    
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json(brand);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await brandService.deleteBrand(id);
    
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getBrandProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await brandService.getBrandProducts(
      id, 
      parseInt(page), 
      parseInt(limit)
    );
    
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createBrand,
  getBrand,
  getBrandBySlug,
  getAllBrands,
  updateBrand,
  deleteBrand,
  getBrandProducts
};