#!/usr/bin/env node

// Comprehensive admin panel test runner
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function checkServerRunning() {
  try {
    const fetch = (await import('node-fetch')).default;
    const https = await import('https');
    
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    const response = await fetch('https://localhost:5011/health', {
      agent,
      timeout: 5000
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function waitForServer(maxWaitTime = 30000) {
  const startTime = Date.now();
  
  colorLog('yellow', '⏳ Waiting for server to start...');
  
  while (Date.now() - startTime < maxWaitTime) {
    if (await checkServerRunning()) {
      colorLog('green', '✅ Server is running!');
      return true;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.stdout.write('.');
  }
  
  console.log('');
  colorLog('red', '❌ Server failed to start within timeout');
  return false;
}

async function runTests() {
  colorLog('cyan', '🧪 Admin Panel Test Suite');
  colorLog('cyan', '========================');
  
  try {
    // Step 1: Check if server is running
    colorLog('blue', '\n📡 Step 1: Checking server status...');
    
    const serverRunning = await checkServerRunning();
    
    if (!serverRunning) {
      colorLog('yellow', '⚠️  Server not running. Please start your server first:');
      colorLog('yellow', '   npm run dev');
      colorLog('yellow', '\nThen run this test again.');
      return;
    }
    
    colorLog('green', '✅ Server is running on https://localhost:5011');

    // Step 2: Create admin user
    colorLog('blue', '\n👤 Step 2: Setting up test users...');
    
    try {
      await runCommand('node', ['create-admin-user.js']);
      colorLog('green', '✅ Test users created successfully');
    } catch (error) {
      colorLog('yellow', '⚠️  User creation failed (users might already exist)');
    }

    // Step 3: Run access tests
    colorLog('blue', '\n🔒 Step 3: Running admin access tests...');
    
    try {
      await runCommand('node', ['test-admin-access.js']);
      colorLog('green', '✅ Access tests completed');
    } catch (error) {
      colorLog('red', '❌ Access tests failed');
      throw error;
    }

    // Step 4: Manual testing instructions
    colorLog('blue', '\n🖱️  Step 4: Manual Testing Instructions');
    colorLog('cyan', '=====================================');
    
    console.log('\n📋 Manual Tests to Perform:');
    console.log('');
    
    console.log('1. 🔐 Test Admin Login:');
    console.log('   • Go to: https://localhost:5011/login');
    console.log('   • Email: admin@example.com');
    console.log('   • Password: admin123');
    console.log('   • Should redirect to dashboard after login');
    console.log('');
    
    console.log('2. 🏠 Test Admin Dashboard:');
    console.log('   • Go to: https://localhost:5011/admin/dashboard');
    console.log('   • Should show statistics cards');
    console.log('   • Should show recent users table');
    console.log('   • Should show navigation sidebar');
    console.log('');
    
    console.log('3. 👥 Test User Management:');
    console.log('   • Go to: https://localhost:5011/admin/users');
    console.log('   • Should show users table');
    console.log('   • Test search functionality');
    console.log('   • Test create user modal');
    console.log('');
    
    console.log('4. 👨‍🏫 Test Instructor Management:');
    console.log('   • Go to: https://localhost:5011/admin/instructors');
    console.log('   • Should show instructors table');
    console.log('   • Test approval workflow');
    console.log('   • Test instructor profile modal');
    console.log('');
    
    console.log('5. 📚 Test Course Management:');
    console.log('   • Go to: https://localhost:5011/admin/courses');
    console.log('   • Should show courses table');
    console.log('   • Test filtering by category/status');
    console.log('');
    
    console.log('6. 🚫 Test Access Control:');
    console.log('   • Logout and try accessing admin pages');
    console.log('   • Should show access denied page');
    console.log('   • Login as regular user (user@example.com / user123)');
    console.log('   • Try accessing admin pages - should be denied');
    console.log('');
    
    console.log('7. 📱 Test Responsive Design:');
    console.log('   • Test on mobile device or resize browser');
    console.log('   • Sidebar should collapse on mobile');
    console.log('   • Tables should be horizontally scrollable');
    console.log('');

    // Step 5: Common issues and solutions
    colorLog('blue', '\n🔧 Common Issues & Solutions');
    colorLog('cyan', '============================');
    
    console.log('\n❓ If admin pages show errors:');
    console.log('   • Check server logs for specific errors');
    console.log('   • Ensure MongoDB is connected');
    console.log('   • Verify user has admin role in database');
    console.log('');
    
    console.log('❓ If login fails:');
    console.log('   • Check if users were created successfully');
    console.log('   • Verify password hashing is working');
    console.log('   • Check authentication middleware');
    console.log('');
    
    console.log('❓ If access denied page doesn\'t show:');
    console.log('   • Check authorization middleware');
    console.log('   • Verify admin routes are protected');
    console.log('   • Check if access-denied.ejs exists');
    console.log('');

    colorLog('green', '\n🎉 Test suite completed successfully!');
    colorLog('cyan', '\n📊 Next Steps:');
    console.log('1. Perform manual tests listed above');
    console.log('2. Check server logs for any errors');
    console.log('3. Test with different user roles');
    console.log('4. Verify all admin functionality works');

  } catch (error) {
    colorLog('red', '\n💥 Test suite failed:');
    console.error(error.message);
    
    colorLog('yellow', '\n🔍 Troubleshooting:');
    console.log('1. Make sure your server is running (npm run dev)');
    console.log('2. Check MongoDB connection');
    console.log('3. Verify all dependencies are installed');
    console.log('4. Check server logs for specific errors');
    
    process.exit(1);
  }
}

// Check if required files exist
function checkRequiredFiles() {
  const requiredFiles = [
    'create-admin-user.js',
    'test-admin-access.js',
    'controllers/webController.js',
    'routes/webRoutes.js',
    'middlewares/auth.js',
    'views/admin/dashboard.ejs',
    'views/admin/users.ejs',
    'views/admin/instructors.ejs',
    'views/admin/courses.ejs',
    'views/admin/access-denied.ejs'
  ];

  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

  if (missingFiles.length > 0) {
    colorLog('red', '❌ Missing required files:');
    missingFiles.forEach(file => console.log(`   • ${file}`));
    console.log('');
    colorLog('yellow', '💡 Make sure all admin panel files are created');
    return false;
  }

  return true;
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  if (!checkRequiredFiles()) {
    process.exit(1);
  }
  
  runTests().catch((error) => {
    colorLog('red', '💥 Unexpected error:');
    console.error(error);
    process.exit(1);
  });
}
