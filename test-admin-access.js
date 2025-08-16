// Test script for admin access functionality
import fetch from 'node-fetch';
import https from 'https';

// Create an agent that ignores SSL certificate errors for testing
const agent = new https.Agent({
  rejectUnauthorized: false
});

const BASE_URL = 'https://localhost:5011';

// Test configuration
const testConfig = {
  adminUser: {
    email: 'admin@example.com',
    password: 'admin123'
  },
  regularUser: {
    email: 'user@example.com', 
    password: 'user123'
  }
};

// Helper function to make requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      agent,
      redirect: 'manual', // Don't follow redirects automatically
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      text: await response.text()
    };
  } catch (error) {
    console.error(`Request failed for ${url}:`, error.message);
    return {
      status: 0,
      error: error.message
    };
  }
}

// Test 1: Access admin pages without authentication
async function testUnauthenticatedAccess() {
  console.log('\n🔒 Testing unauthenticated access to admin pages...');
  
  const adminPages = [
    '/admin/dashboard',
    '/admin/users', 
    '/admin/instructors',
    '/admin/courses'
  ];
  
  for (const page of adminPages) {
    const response = await makeRequest(`${BASE_URL}${page}`);
    
    if (response.status === 302) {
      console.log(`✅ ${page}: Redirected to login (${response.status})`);
    } else if (response.status === 401 || response.status === 403) {
      console.log(`✅ ${page}: Access denied (${response.status})`);
    } else if (response.text && response.text.includes('Access Denied')) {
      console.log(`✅ ${page}: Access denied page shown`);
    } else {
      console.log(`❌ ${page}: Unexpected response (${response.status})`);
    }
  }
}

// Test 2: Login and get cookies
async function testLogin(credentials) {
  console.log(`\n🔑 Testing login for ${credentials.email}...`);

  const response = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify(credentials),
    redirect: 'follow' // Allow redirects for login
  });
  
  if (response.status === 200) {
    const cookies = response.headers.get('set-cookie');
    console.log(`✅ Login successful for ${credentials.email}`);
    return cookies;
  } else {
    console.log(`❌ Login failed for ${credentials.email}: ${response.status} ${response.statusText}`);
    console.log('Response:', response.text.substring(0, 200));
    return null;
  }
}

// Test 3: Access admin pages with authentication
async function testAuthenticatedAccess(cookies, userType) {
  console.log(`\n👤 Testing authenticated access as ${userType}...`);
  
  const adminPages = [
    '/admin/dashboard',
    '/admin/users',
    '/admin/instructors', 
    '/admin/courses'
  ];
  
  for (const page of adminPages) {
    const response = await makeRequest(`${BASE_URL}${page}`, {
      headers: {
        'Cookie': cookies
      },
      redirect: 'follow' // Allow redirects for authenticated requests
    });
    
    if (response.status === 200) {
      if (response.text.includes('Admin Panel') || response.text.includes('Admin Dashboard')) {
        console.log(`✅ ${page}: Access granted (${response.status})`);
      } else {
        console.log(`⚠️  ${page}: Response received but content unclear (${response.status})`);
      }
    } else if (response.status === 403 || response.text.includes('Access Denied')) {
      console.log(`🚫 ${page}: Access denied (${response.status})`);
    } else if (response.status === 302) {
      console.log(`🔄 ${page}: Redirected (${response.status})`);
    } else {
      console.log(`❌ ${page}: Unexpected response (${response.status})`);
    }
  }
}

// Test 4: Test specific admin functionality
async function testAdminFunctionality(cookies) {
  console.log('\n⚙️  Testing admin functionality...');
  
  // Test dashboard data loading
  const dashboardResponse = await makeRequest(`${BASE_URL}/admin/dashboard`, {
    headers: { 'Cookie': cookies },
    redirect: 'follow' // Allow redirects for authenticated requests
  });
  
  if (dashboardResponse.status === 200) {
    const content = dashboardResponse.text;
    
    // Check for key dashboard elements
    const checks = [
      { name: 'Stats Cards', check: content.includes('Total Users') },
      { name: 'Navigation Sidebar', check: content.includes('Admin Panel') },
      { name: 'Recent Users Table', check: content.includes('Recent Users') },
      { name: 'Quick Actions', check: content.includes('Quick Actions') }
    ];
    
    checks.forEach(({ name, check }) => {
      console.log(`${check ? '✅' : '❌'} Dashboard ${name}: ${check ? 'Found' : 'Missing'}`);
    });
  } else {
    console.log(`❌ Dashboard not accessible: ${dashboardResponse.status}`);
  }
}

// Test 5: Test access denied page
async function testAccessDeniedPage() {
  console.log('\n🚫 Testing access denied page...');
  
  const response = await makeRequest(`${BASE_URL}/admin/dashboard`);
  
  if (response.text.includes('Access Denied') || response.text.includes('access denied')) {
    console.log('✅ Access denied page is working');
  } else {
    console.log('❌ Access denied page not found or not working properly');
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Starting Admin Panel Access Tests...');
  console.log('=====================================');
  
  try {
    // Test 1: Unauthenticated access
    await testUnauthenticatedAccess();
    
    // Test 2: Access denied page
    await testAccessDeniedPage();
    
    // Test 3: Try to login as admin (this might fail if user doesn't exist)
    const adminCookies = await testLogin(testConfig.adminUser);
    
    if (adminCookies) {
      // Test 4: Admin access with authentication
      await testAuthenticatedAccess(adminCookies, 'admin');
      
      // Test 5: Admin functionality
      await testAdminFunctionality(adminCookies);
    } else {
      console.log('\n⚠️  Skipping admin authentication tests - login failed');
      console.log('   This is expected if admin user doesn\'t exist in database');
    }
    
    // Test 6: Try to login as regular user (this might also fail)
    const userCookies = await testLogin(testConfig.regularUser);
    
    if (userCookies) {
      // Test 7: Regular user access (should be denied)
      await testAuthenticatedAccess(userCookies, 'regular user');
    } else {
      console.log('\n⚠️  Skipping regular user tests - login failed');
      console.log('   This is expected if regular user doesn\'t exist in database');
    }
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
  }
  
  console.log('\n🏁 Tests completed!');
  console.log('\n📋 Summary:');
  console.log('- Admin panel pages should redirect unauthenticated users');
  console.log('- Access denied page should be shown for unauthorized users');
  console.log('- Admin users should have full access to all admin pages');
  console.log('- Regular users should be denied access to admin pages');
}

// Run the tests
runTests().catch(console.error);
