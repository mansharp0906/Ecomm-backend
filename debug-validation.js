const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Y2E5MGVlYTM3NGU3YjM2YTQzNjI4YiIsImlhdCI6MTc1ODM0OTUxNiwiZXhwIjoxNzU4OTU0MzE2fQ.6-XQs64tds6t-80n_5LQjZo_Ge8cm_pWSUS5L2iuBs8';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Test the exact payload structure your validation expects
async function testOrderValidation() {
  console.log('Testing order validation...');
  
  const testPayload = {
    shippingAddress: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      phone: '+1234567890',
      address: '456 Admin Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zipCode: '94102',
      landmark: 'Near City Hall'
    },
    billingAddress: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      phone: '+1234567890',
      address: '456 Admin Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zipCode: '94102',
      landmark: 'Near City Hall'
    },
    paymentMethod: 'card',
    shipping: 100,
    tax: 1440,
    discount: 0
  };

  console.log('Sending payload:', JSON.stringify(testPayload, null, 2));

  try {
    const response = await api.post('/orders', testPayload);
    console.log('✅ Order created successfully!');
    console.log('Order ID:', response.data.data.order._id);
  } catch (error) {
    console.log('❌ Order failed:', error.response?.data?.message);
    if (error.response?.data?.errors) {
      console.log('Validation errors:');
      error.response.data.errors.forEach(err => {
        console.log(`- ${err.path}: ${err.msg}`);
      });
    }
  }
}

// Test product response structure
async function testProductResponse() {
  console.log('\nTesting product response structure...');
  
  try {
    const response = await api.get('/products');
    console.log('Response keys:', Object.keys(response.data));
    console.log('Data keys:', response.data.data ? Object.keys(response.data.data) : 'No data field');
    
    if (response.data.data && response.data.data.products) {
      console.log('Number of products:', response.data.data.products.length);
    } else if (response.data.products) {
      console.log('Number of products:', response.data.products.length);
    } else if (Array.isArray(response.data)) {
      console.log('Number of products:', response.data.length);
    }
  } catch (error) {
    console.log('❌ Product test failed:', error.response?.data || error.message);
  }
}

async function runDebug() {
  await testOrderValidation();
  await testProductResponse();
}

runDebug();