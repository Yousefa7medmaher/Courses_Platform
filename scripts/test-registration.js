import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/usermodel.js';

// Load environment variables
dotenv.config();

async function testRegistration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🧪 Testing Simple Registration...\n');

    // Test data - simple and easy to remember
    const testUsers = [
      {
        name: 'John Doe',
        email: 'john@test.com',
        password: 'password123',
        role: 'student'
      },
      {
        name: 'Jane Smith',
        email: 'jane@test.com',
        password: 'password123',
        role: 'instructor'
      },
      {
        name: 'Bob Wilson',
        email: 'bob@test.com',
        password: 'simple123',
        role: 'student'
      }
    ];

    // Clean up existing test users
    console.log('🧹 Cleaning up existing test users...');
    for (const userData of testUsers) {
      await User.deleteOne({ email: userData.email });
    }
    console.log('✅ Cleanup completed');

    // Test registration for each user
    for (const userData of testUsers) {
      console.log(`\n👤 Testing registration for ${userData.name} (${userData.email})...`);
      
      try {
        // Create user using the model (same as the service does)
        const user = new User({
          name: userData.name,
          email: userData.email.toLowerCase(),
          password: userData.password,
          role: userData.role,
          authType: 'local'
        });

        await user.save();
        console.log(`   ✅ Registration successful!`);

        // Verify the user was saved correctly
        const savedUser = await User.findOne({ email: userData.email }).select('+password');
        console.log(`   ✅ User found in database`);
        console.log(`   📧 Email: ${savedUser.email}`);
        console.log(`   👤 Name: ${savedUser.name}`);
        console.log(`   🎭 Role: ${savedUser.role}`);
        console.log(`   🔐 Password hashed: ${savedUser.password.startsWith('$2b$') ? 'Yes' : 'No'}`);

        // Test password validation
        const isPasswordValid = await savedUser.isPasswordValid(userData.password);
        console.log(`   🔑 Password validation: ${isPasswordValid ? '✅ PASS' : '❌ FAIL'}`);

      } catch (error) {
        console.log(`   ❌ Registration failed: ${error.message}`);
      }
    }

    console.log('\n📋 Test Summary:');
    const allUsers = await User.find({ 
      email: { $in: testUsers.map(u => u.email) } 
    });
    console.log(`   Created users: ${allUsers.length}/${testUsers.length}`);
    
    if (allUsers.length > 0) {
      console.log('\n🎯 Test Credentials for Manual Testing:');
      for (const user of allUsers) {
        const originalUser = testUsers.find(u => u.email === user.email);
        console.log(`   📧 ${user.email} | 🔑 ${originalUser.password} | 🎭 ${user.role}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

async function cleanupTestUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🧹 Cleaning up all test users...');
    
    const testEmails = [
      'john@test.com',
      'jane@test.com', 
      'bob@test.com',
      'test@example.com',
      'newtest@example.com',
      'verify@example.com'
    ];

    const result = await User.deleteMany({ 
      email: { $in: testEmails } 
    });

    console.log(`✅ Deleted ${result.deletedCount} test users`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Check command line arguments
const command = process.argv[2];

if (command === 'test') {
  console.log('🧪 Running registration tests...\n');
  testRegistration();
} else if (command === 'clean') {
  console.log('🧹 Cleaning up test users...\n');
  cleanupTestUsers();
} else {
  console.log('Usage:');
  console.log('  node scripts/test-registration.js test   - Run registration tests');
  console.log('  node scripts/test-registration.js clean  - Clean up test users');
  process.exit(1);
}
