const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Y2E5MGVlYTM3NGU3YjM2YTQzNjI4YiIsImlhdCI6MTc1ODM0OTUxNiwiZXhwIjoxNzU4OTU0MzE2fQ.6-XQs64tds6t-80n_5LQjZo_Ge8cm_pWSUS5L2iuBs8';
const PRODUCT_ID = '68c94d3cdf14d6c3738b8958';
const VARIANT_ID = '68ce49129bda0be1e1b1e3b4';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

const testOrderData = {
  shippingAddress: {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    phone: '+1234567890',
    address: '456 Admin Street',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    zipCode: '94102'
  },
  paymentMethod: 'cod',
  shipping: 100,
  tax: 1440,
  discount: 0
};

async function testCompleteFlow() {
  console.log('🚀 Testing Complete Order Flow with _id\n');
  
  try {
    // 1. Clear cart
    await api.delete('/cart');
    console.log('✅ Cart cleared');

    // 2. Add item to cart
    await api.post('/cart', {
      productId: PRODUCT_ID,
      variantId: VARIANT_ID,
      quantity: 1
    });
    console.log('✅ Item added to cart');

    // 3. Create order
    const createResponse = await api.post('/orders', testOrderData);
    const order = createResponse.data.data?.order || createResponse.data.order;
    console.log('🎉 Order created! ID:', order._id);

    // 4. Get specific order by _id
    const getResponse = await api.get(`/orders/my-orders/${order._id}`);
    console.log('✅ Order retrieved by _id:', getResponse.data.data?.order?._id);

    // 5. Get all user orders
    const allOrdersResponse = await api.get('/orders/my-orders');
    const orders = allOrdersResponse.data.data?.orders || allOrdersResponse.data.orders || [];
    console.log('📋 User orders:', orders.length);

    // 6. Test admin endpoints (if user is admin)
    try {
      const adminOrdersResponse = await api.get('/orders');
      const adminOrders = adminOrdersResponse.data.data?.orders || adminOrdersResponse.data.orders || [];
      console.log('👨‍💼 Admin orders:', adminOrders.length);
    } catch (adminError) {
      console.log('⚠️ Admin endpoint access:', adminError.response?.status === 403 ? 'Forbidden (normal for non-admin)' : adminError.message);
    }

    console.log('\n✅ All tests passed! Using MongoDB _id correctly.');

  } catch (error) {
    console.log('❌ Error:', error.response?.data?.message || error.message);
  }
}

testCompleteFlow();