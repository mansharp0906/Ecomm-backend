const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Y2E5MGVlYTM3NGU3YjM2YTQzNjI4YiIsImlhdCI6MTc1ODM0OTUxNiwiZXhwIjoxNzU4OTU0MzE2fQ.6-XQs64tds6t-80n_5LQjZo_Ge8cm_pWSUS5L2iuBs8';
const PRODUCT_ID = '68c94d3cdf14d6c3738b8958';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function addVariant() {
  try {
    console.log('Adding variant to product as admin...');
    
    const response = await api.put(`/products/${PRODUCT_ID}`, {
      variants: [{
        sku: 'SGS23-BLACK-128',
        price: 79999,
        mrp: 84999,
        weight: 0.18,
        stock: 10,
        status: 'active'
      }]
    });
    
    console.log('✅ Variant added successfully!');
    console.log('Variant ID:', response.data.data.product.variants[0]._id);
    
    return response.data.data.product.variants[0]._id;
    
  } catch (error) {
    console.error('❌ Failed to add variant:', error.response?.data || error.message);
    return null;
  }
}

addVariant();