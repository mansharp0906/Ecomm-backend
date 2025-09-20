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

async function testUserInfo() {
  try {
    console.log('Testing user info endpoint...');
    
    // Test getting current user profile
    const profileResponse = await api.get('/users/profile/me');
    console.log('✅ User profile retrieved');
    console.log('User role:', profileResponse.data.data.user.role);
    console.log('User permissions:', profileResponse.data.data.user.permissions);
    
    // Test getting all users (admin endpoint)
    console.log('\nTesting admin endpoint...');
    const usersResponse = await api.get('/users');
    console.log('✅ Admin endpoint accessible');
    console.log('Number of users:', usersResponse.data.data.users.length);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testUserInfo();