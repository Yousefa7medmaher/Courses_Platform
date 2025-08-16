import fetch from 'node-fetch';
import https from 'https';

const agent = new https.Agent({
  rejectUnauthorized: false
});

const BASE_URL = 'https://localhost:5011';

async function testAdminLogin() {
  console.log('🔍 Testing admin login and access...\n');
  
  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      agent,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    console.log('Login status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login failed');
      return;
    }
    
    // Get cookies from login
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Cookies:', cookies);
    
    // Step 2: Test admin dashboard
    console.log('\n2. Testing admin dashboard...');
    const dashboardResponse = await fetch(`${BASE_URL}/admin/dashboard`, {
      agent,
      headers: {
        'Cookie': cookies
      },
      redirect: 'manual'
    });
    
    console.log('Dashboard status:', dashboardResponse.status);
    console.log('Dashboard headers:', Object.fromEntries(dashboardResponse.headers.entries()));
    
    if (dashboardResponse.status === 500) {
      const errorText = await dashboardResponse.text();
      console.log('Error response:', errorText.substring(0, 500));
    } else if (dashboardResponse.status === 200) {
      console.log('✅ Dashboard accessible');
    } else {
      console.log('Unexpected status:', dashboardResponse.status);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAdminLogin();
