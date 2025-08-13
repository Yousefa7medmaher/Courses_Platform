import https from 'https';
import { URL } from 'url';
import { parse } from 'cookie';

// Disable SSL verification for self-signed certificates
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

class WebAuthTester {
  constructor() {
    this.cookies = {};
    this.baseUrl = 'https://localhost:5011';
  }

  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      
      const requestOptions = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          ...options.headers
        }
      };

      // Add cookies if we have any
      if (Object.keys(this.cookies).length > 0) {
        requestOptions.headers['Cookie'] = Object.entries(this.cookies)
          .map(([key, value]) => `${key}=${value}`)
          .join('; ');
      }

      // Add content type and length for POST requests
      if (options.body) {
        requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
      }

      const req = https.request(requestOptions, (res) => {
        let data = '';

        // Store cookies from response
        if (res.headers['set-cookie']) {
          res.headers['set-cookie'].forEach(cookie => {
            const parsed = parse(cookie);
            Object.assign(this.cookies, parsed);
          });
        }

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            cookies: this.cookies
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  encodeFormData(data) {
    return Object.entries(data)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  }

  async testRegistration(userData) {
    console.log(`📝 Testing registration for ${userData.email}...`);
    
    try {
      // First, get the registration page to establish session
      const getResponse = await this.makeRequest('/register');
      console.log(`   📄 GET /register: ${getResponse.statusCode}`);

      // Submit registration form
      const formData = this.encodeFormData({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.password,
        role: userData.role,
        terms: 'on'
      });

      const postResponse = await this.makeRequest('/register', {
        method: 'POST',
        body: formData,
        headers: {
          'Referer': `${this.baseUrl}/register`
        }
      });

      console.log(`   📤 POST /register: ${postResponse.statusCode}`);
      
      if (postResponse.statusCode === 302) {
        const location = postResponse.headers.location;
        console.log(`   ↪️  Redirected to: ${location}`);
        
        if (location === '/login') {
          console.log(`   ✅ Registration successful!`);
          return { success: true, message: 'Registration successful' };
        } else if (location === '/register') {
          console.log(`   ❌ Registration failed (redirected back to register)`);
          return { success: false, message: 'Registration failed' };
        }
      }

      return { success: false, message: `Unexpected response: ${postResponse.statusCode}` };

    } catch (error) {
      console.log(`   ❌ Registration error: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  async testLogin(email, password) {
    console.log(`🔐 Testing login for ${email}...`);
    
    try {
      // Get login page
      const getResponse = await this.makeRequest('/login');
      console.log(`   📄 GET /login: ${getResponse.statusCode}`);

      // Submit login form
      const formData = this.encodeFormData({
        email: email,
        password: password
      });

      const postResponse = await this.makeRequest('/login', {
        method: 'POST',
        body: formData,
        headers: {
          'Referer': `${this.baseUrl}/login`
        }
      });

      console.log(`   📤 POST /login: ${postResponse.statusCode}`);
      
      if (postResponse.statusCode === 302) {
        const location = postResponse.headers.location;
        console.log(`   ↪️  Redirected to: ${location}`);
        
        if (location === '/' || location.includes('dashboard')) {
          console.log(`   ✅ Login successful!`);
          return { success: true, message: 'Login successful' };
        } else if (location === '/login') {
          console.log(`   ❌ Login failed (redirected back to login)`);
          return { success: false, message: 'Login failed' };
        }
      }

      return { success: false, message: `Unexpected response: ${postResponse.statusCode}` };

    } catch (error) {
      console.log(`   ❌ Login error: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  async runTests() {
    console.log('🧪 Testing Web Authentication Flow...\n');

    // Test 1: Register a new user
    const newUser = {
      name: 'Web Test User',
      email: 'webtest@example.com',
      password: 'webtest123',
      role: 'student'
    };

    const regResult = await this.testRegistration(newUser);
    console.log('');

    // Test 2: Login with existing user
    const loginResult = await this.testLogin('john@test.com', 'password123');
    console.log('');

    // Test 3: Login with wrong password
    const wrongPassResult = await this.testLogin('john@test.com', 'wrongpassword');
    console.log('');

    // Test 4: Try to register duplicate email
    const dupResult = await this.testRegistration({
      name: 'Duplicate User',
      email: 'john@test.com', // Existing email
      password: 'test123',
      role: 'student'
    });
    console.log('');

    // Summary
    console.log('📋 Test Summary:');
    console.log(`   Registration (new user): ${regResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Login (correct credentials): ${loginResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Login (wrong password): ${!wrongPassResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Registration (duplicate): ${!dupResult.success ? '✅ PASS' : '❌ FAIL'}`);

    const passCount = [regResult.success, loginResult.success, !wrongPassResult.success, !dupResult.success]
      .filter(Boolean).length;
    
    console.log(`\n🎯 Overall: ${passCount}/4 tests passed`);
    
    if (passCount === 4) {
      console.log('🎉 All tests passed! Web authentication is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Check the logs above for details.');
    }
  }
}

// Run the tests
const tester = new WebAuthTester();
tester.runTests().catch(console.error);
