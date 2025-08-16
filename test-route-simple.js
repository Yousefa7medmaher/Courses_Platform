// Simple test to check if admin route is being hit
import fetch from 'node-fetch';
import https from 'https';

const agent = new https.Agent({
  rejectUnauthorized: false
});

const BASE_URL = 'https://localhost:5011';

async function testRoute() {
  try {
    console.log('🔍 Testing if admin route is being hit...\n');
    
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
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login failed');
      return;
    }
    
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('✅ Login successful');
    
    // Step 2: Test a simple route first
    console.log('\n2. Testing home page...');
    const homeResponse = await fetch(`${BASE_URL}/`, {
      agent,
      headers: {
        'Cookie': cookies || ''
      }
    });
    console.log('Home page status:', homeResponse.status);
    
    // Step 3: Test admin route with detailed error info
    console.log('\n3. Testing admin dashboard with detailed error...');
    const dashboardResponse = await fetch(`${BASE_URL}/admin/dashboard`, {
      agent,
      headers: {
        'Cookie': cookies || ''
      }
    });
    
    console.log('Dashboard status:', dashboardResponse.status);
    console.log('Dashboard headers:', Object.fromEntries(dashboardResponse.headers.entries()));
    
    if (dashboardResponse.status === 500) {
      const errorText = await dashboardResponse.text();
      
      // Look for specific error patterns
      if (errorText.includes('Cannot read properties')) {
        console.log('❌ Property access error detected');
      } else if (errorText.includes('is not defined')) {
        console.log('❌ Variable not defined error detected');
      } else if (errorText.includes('Cannot find module')) {
        console.log('❌ Module import error detected');
      } else if (errorText.includes('Error loading admin dashboard')) {
        console.log('❌ Admin dashboard specific error detected');
      } else {
        console.log('❌ Unknown 500 error');
      }
      
      // Check if it's using the wrong layout
      if (errorText.includes('main-header') && errorText.includes('main-footer')) {
        console.log('⚠️ Error: Admin page is using main layout instead of admin layout');
      }
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testRoute();
