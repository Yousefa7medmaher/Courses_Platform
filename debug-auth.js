// Debug script to test authentication middleware
import fetch from 'node-fetch';
import https from 'https';

const agent = new https.Agent({
  rejectUnauthorized: false
});

const BASE_URL = 'https://localhost:5011';

async function testAuthMiddleware() {
  console.log('🔍 Testing authentication middleware...\n');
  
  try {
    // Test admin dashboard without authentication
    console.log('Testing /admin/dashboard without auth...');
    const response = await fetch(`${BASE_URL}/admin/dashboard`, {
      agent,
      redirect: 'manual' // Don't follow redirects automatically
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 302) {
      console.log('✅ Correctly redirected (302)');
      console.log('Location:', response.headers.get('location'));
    } else if (response.status === 200) {
      console.log('❌ Returned 200 - middleware not working');
      const text = await response.text();
      console.log('Response preview:', text.substring(0, 200));
    } else {
      console.log('Unexpected status:', response.status);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAuthMiddleware();
