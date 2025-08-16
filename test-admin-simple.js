// Simple test to debug admin access issues
import fetch from 'node-fetch';
import https from 'https';

const agent = new https.Agent({
  rejectUnauthorized: false
});

const BASE_URL = 'https://localhost:5011';

async function testAdminAccess() {
  try {
    console.log('🔐 Testing admin access...\n');
    
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
    
    if (loginResponse.status !== 200) {
      const errorText = await loginResponse.text();
      console.log('Login failed:', errorText);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData.success);
    
    // Get cookies
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Got cookies:', !!cookies);
    
    // Step 2: Test admin dashboard
    console.log('\n2. Testing admin dashboard...');
    const dashboardResponse = await fetch(`${BASE_URL}/admin/dashboard`, {
      agent,
      headers: {
        'Cookie': cookies || ''
      }
    });
    
    console.log('Dashboard status:', dashboardResponse.status);
    
    if (dashboardResponse.status === 500) {
      const errorText = await dashboardResponse.text();
      console.log('500 Error details:');
      console.log(errorText);
    } else if (dashboardResponse.status === 200) {
      console.log('✅ Dashboard accessible');
      const content = await dashboardResponse.text();
      if (content.includes('Admin Dashboard')) {
        console.log('✅ Dashboard content looks correct');
      } else {
        console.log('⚠️ Dashboard content might be wrong');
      }
    } else {
      console.log('Unexpected status:', dashboardResponse.status);
      const content = await dashboardResponse.text();
      console.log('Response:', content.substring(0, 200));
    }
    
    // Step 3: Test regular user access
    console.log('\n3. Testing regular user access...');
    const userLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      agent,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'user123'
      })
    });
    
    if (userLoginResponse.status === 200) {
      const userCookies = userLoginResponse.headers.get('set-cookie');
      
      const userDashboardResponse = await fetch(`${BASE_URL}/admin/dashboard`, {
        agent,
        headers: {
          'Cookie': userCookies || ''
        }
      });
      
      console.log('Regular user admin access status:', userDashboardResponse.status);
      
      if (userDashboardResponse.status === 200) {
        const content = await userDashboardResponse.text();
        if (content.includes('Access Denied')) {
          console.log('✅ Access denied page shown correctly');
        } else {
          console.log('❌ Regular user has admin access (should be denied)');
        }
      } else if (userDashboardResponse.status === 403) {
        console.log('✅ Access denied (403)');
      } else {
        console.log('Unexpected status for regular user:', userDashboardResponse.status);
      }
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testAdminAccess();
