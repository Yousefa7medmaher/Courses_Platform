import https from 'https';
import { URL } from 'url';

// Disable SSL verification for self-signed certificates
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

async function testLogin(email, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: email,
      password: password
    });

    const options = {
      hostname: 'localhost',
      port: 5011,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: response
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testRegister(userData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(userData);

    const options = {
      hostname: 'localhost',
      port: 5011,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: response
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Authentication API...\n');

  try {
    // Test 1: Login with test user
    console.log('1️⃣ Testing login with test user...');
    const loginResult = await testLogin('test@example.com', 'password123');
    console.log(`   Status: ${loginResult.statusCode}`);
    console.log(`   Response:`, JSON.stringify(loginResult.body, null, 2));
    
    if (loginResult.statusCode === 200) {
      console.log('   ✅ Login successful!');
    } else {
      console.log('   ❌ Login failed!');
    }
    console.log('');

    // Test 2: Login with wrong password
    console.log('2️⃣ Testing login with wrong password...');
    const wrongPasswordResult = await testLogin('test@example.com', 'wrongpassword');
    console.log(`   Status: ${wrongPasswordResult.statusCode}`);
    console.log(`   Response:`, JSON.stringify(wrongPasswordResult.body, null, 2));
    
    if (wrongPasswordResult.statusCode === 400) {
      console.log('   ✅ Correctly rejected wrong password!');
    } else {
      console.log('   ❌ Should have rejected wrong password!');
    }
    console.log('');

    // Test 3: Login with non-existent user
    console.log('3️⃣ Testing login with non-existent user...');
    const nonExistentResult = await testLogin('nonexistent@example.com', 'password123');
    console.log(`   Status: ${nonExistentResult.statusCode}`);
    console.log(`   Response:`, JSON.stringify(nonExistentResult.body, null, 2));
    
    if (nonExistentResult.statusCode === 400) {
      console.log('   ✅ Correctly rejected non-existent user!');
    } else {
      console.log('   ❌ Should have rejected non-existent user!');
    }
    console.log('');

    // Test 4: Register duplicate user
    console.log('4️⃣ Testing registration with existing email...');
    const duplicateResult = await testRegister({
      name: 'Test User 2',
      email: 'test@example.com',
      password: 'password123',
      role: 'student'
    });
    console.log(`   Status: ${duplicateResult.statusCode}`);
    console.log(`   Response:`, JSON.stringify(duplicateResult.body, null, 2));
    
    if (duplicateResult.statusCode === 400) {
      console.log('   ✅ Correctly rejected duplicate email!');
    } else {
      console.log('   ❌ Should have rejected duplicate email!');
    }
    console.log('');

    // Test 5: Register new user
    console.log('5️⃣ Testing registration with new email...');
    const newUserResult = await testRegister({
      name: 'New Test User',
      email: 'newtest@example.com',
      password: 'password123',
      role: 'student'
    });
    console.log(`   Status: ${newUserResult.statusCode}`);
    console.log(`   Response:`, JSON.stringify(newUserResult.body, null, 2));
    
    if (newUserResult.statusCode === 201) {
      console.log('   ✅ Registration successful!');
      
      // Test login with new user
      console.log('   🔄 Testing login with newly registered user...');
      const newUserLoginResult = await testLogin('newtest@example.com', 'password123');
      console.log(`   Login Status: ${newUserLoginResult.statusCode}`);
      
      if (newUserLoginResult.statusCode === 200) {
        console.log('   ✅ New user login successful!');
      } else {
        console.log('   ❌ New user login failed!');
        console.log(`   Login Response:`, JSON.stringify(newUserLoginResult.body, null, 2));
      }
    } else {
      console.log('   ❌ Registration failed!');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }

  console.log('\n🏁 Tests completed!');
}

runTests();
