// quick-test-offline-order.js
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZDNkNTJkM2ZkMGZmNTVlNmJmMjY2OCIsImlhdCI6MTc1ODcxMzEzMywiZXhwIjoxNzU5MzE3OTMzfQ.kIjaZkuPUfJUjGuvaLEutD2tGYAkUoqNmxMT6RNvxnI';

const testData = [{
    title: "Test Product for Offline Orders",
    description: "Test product for offline order testing",
    shortDescription: "Test product",
    sku: "TEST-OFFLINE-001",
    brand: "68d38d11469f0c387179884d", // Use existing brand ID
    category: "68d1101aa2d7787c701ced98", // Use existing category ID
    type: "physical",
    status: "active",
    variants: [
        {
            color: "Black",
            size: "M",
            price: 1999,
            mrp: 2499,
            stock: 100,
            sku: "TEST-BLK-M"
        },
        {
            color: "Blue",
            size: "L",
            price: 2099,
            mrp: 2599,
            stock: 50,
            sku: "TEST-BLU-L"
        }
    ],
    tax: 18,
    shippingCost: 50,
    weight: 0.3
}];

async function quickTest() {
  try {
    const response = await axios.post(`${BASE_URL}/orders/create-offline`, testData, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success! Order created:');
    console.log(`Order ID: ${response.data.order.orderId}`);
    console.log(`Total: ₹${response.data.order.grandTotal}`);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}
quickTest();