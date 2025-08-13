import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/usermodel.js';

// Load environment variables
dotenv.config();

async function fixDoubleHashedPasswords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users with local auth type
    const users = await User.find({ authType: 'local' }).select('+password');
    console.log(`Found ${users.length} local users`);

    if (users.length === 0) {
      console.log('No users found to fix');
      return;
    }

    console.log('\n🔧 Checking for double-hashed passwords...\n');

    for (const user of users) {
      console.log(`Checking user: ${user.email}`);
      
      // Check if password looks like a bcrypt hash (starts with $2b$ and has proper length)
      const isAlreadyHashed = user.password && user.password.startsWith('$2b$') && user.password.length === 60;
      
      if (isAlreadyHashed) {
        console.log(`  ✅ Password for ${user.email} appears to be properly hashed`);
      } else {
        console.log(`  ❌ Password for ${user.email} appears to be double-hashed or corrupted`);
        console.log(`  Password length: ${user.password ? user.password.length : 'null'}`);
        console.log(`  Password starts with: ${user.password ? user.password.substring(0, 10) : 'null'}...`);
      }
    }

    console.log('\n📋 Summary:');
    const properlyHashed = users.filter(u => u.password && u.password.startsWith('$2b$') && u.password.length === 60);
    const problematic = users.filter(u => !u.password || !u.password.startsWith('$2b$') || u.password.length !== 60);
    
    console.log(`  ✅ Properly hashed passwords: ${properlyHashed.length}`);
    console.log(`  ❌ Problematic passwords: ${problematic.length}`);

    if (problematic.length > 0) {
      console.log('\n⚠️  WARNING: Found users with problematic passwords!');
      console.log('These users will not be able to login until their passwords are reset.');
      console.log('\nProblematic users:');
      problematic.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user._id})`);
      });
      
      console.log('\n💡 To fix this, you can either:');
      console.log('1. Ask these users to reset their passwords');
      console.log('2. Manually set a temporary password for them');
      console.log('3. Delete these users if they are test accounts');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const testEmail = 'test@example.com';
    const testPassword = 'password123';

    // Check if test user already exists
    const existingUser = await User.findOne({ email: testEmail });
    if (existingUser) {
      console.log(`❌ Test user ${testEmail} already exists`);
      
      // Delete the existing user
      await User.deleteOne({ email: testEmail });
      console.log(`🗑️  Deleted existing test user ${testEmail}`);
    }

    // Create new test user
    const testUser = new User({
      name: 'Test User',
      email: testEmail,
      password: testPassword,
      role: 'student',
      authType: 'local'
    });

    await testUser.save();
    console.log(`✅ Created test user: ${testEmail} with password: ${testPassword}`);

    // Verify the user can be found and password is properly hashed
    const savedUser = await User.findOne({ email: testEmail }).select('+password');
    console.log(`🔍 Saved user password hash: ${savedUser.password.substring(0, 20)}...`);
    console.log(`🔍 Password hash length: ${savedUser.password.length}`);
    console.log(`🔍 Password starts with $2b$: ${savedUser.password.startsWith('$2b$')}`);

    // Test password validation
    const isValid = await savedUser.isPasswordValid(testPassword);
    console.log(`🔐 Password validation test: ${isValid ? '✅ PASS' : '❌ FAIL'}`);

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Check command line arguments
const command = process.argv[2];

if (command === 'check') {
  console.log('🔍 Checking for password issues...\n');
  fixDoubleHashedPasswords();
} else if (command === 'test') {
  console.log('🧪 Creating test user...\n');
  createTestUser();
} else {
  console.log('Usage:');
  console.log('  node scripts/fix-passwords.js check  - Check for password issues');
  console.log('  node scripts/fix-passwords.js test   - Create a test user');
  process.exit(1);
}
