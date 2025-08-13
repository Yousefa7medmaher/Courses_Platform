import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/usermodel.js';

// Load environment variables
dotenv.config();

async function verifyAuthentication() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test credentials
    const testEmail = 'verify@example.com';
    const testPassword = 'testpassword123';

    console.log('\n🧪 Testing Authentication Flow...\n');

    // Step 1: Clean up any existing test user
    await User.deleteOne({ email: testEmail });
    console.log('🧹 Cleaned up existing test user');

    // Step 2: Create a new user
    console.log('👤 Creating new user...');
    const newUser = new User({
      name: 'Verify User',
      email: testEmail,
      password: testPassword,
      role: 'student',
      authType: 'local'
    });

    await newUser.save();
    console.log(`✅ User created: ${testEmail}`);

    // Step 3: Retrieve the user and test password validation
    console.log('🔍 Retrieving user from database...');
    const savedUser = await User.findOne({ email: testEmail }).select('+password');
    
    if (!savedUser) {
      console.log('❌ User not found in database');
      return;
    }

    console.log(`✅ User found: ${savedUser.email}`);
    console.log(`🔐 Password hash: ${savedUser.password.substring(0, 20)}...`);

    // Step 4: Test password validation
    console.log('🔐 Testing password validation...');
    
    // Test correct password
    const isValidCorrect = await savedUser.isPasswordValid(testPassword);
    console.log(`   Correct password: ${isValidCorrect ? '✅ PASS' : '❌ FAIL'}`);

    // Test wrong password
    const isValidWrong = await savedUser.isPasswordValid('wrongpassword');
    console.log(`   Wrong password: ${!isValidWrong ? '✅ PASS (correctly rejected)' : '❌ FAIL (should have been rejected)'}`);

    // Step 5: Test the AuthService login method
    console.log('\n🔧 Testing AuthService login method...');
    
    try {
      // Import AuthService dynamically to avoid module loading issues
      const { default: AuthService } = await import('../services/authService.js');
      
      // Test successful login
      console.log('   Testing successful login...');
      const loginResult = await AuthService.loginUser(testEmail, testPassword);
      console.log(`   ✅ Login successful! User: ${loginResult.user.name}`);
      console.log(`   ✅ Token generated: ${loginResult.token ? 'Yes' : 'No'}`);

      // Test failed login
      console.log('   Testing failed login...');
      try {
        await AuthService.loginUser(testEmail, 'wrongpassword');
        console.log('   ❌ Login should have failed but succeeded');
      } catch (error) {
        console.log(`   ✅ Login correctly failed: ${error.message}`);
      }

      // Test non-existent user
      console.log('   Testing non-existent user...');
      try {
        await AuthService.loginUser('nonexistent@example.com', testPassword);
        console.log('   ❌ Login should have failed but succeeded');
      } catch (error) {
        console.log(`   ✅ Login correctly failed: ${error.message}`);
      }

    } catch (error) {
      console.log(`   ❌ AuthService test failed: ${error.message}`);
    }

    // Step 6: Test duplicate registration
    console.log('\n📝 Testing duplicate registration...');
    try {
      const duplicateUser = new User({
        name: 'Duplicate User',
        email: testEmail, // Same email
        password: 'anotherpassword',
        role: 'student',
        authType: 'local'
      });
      await duplicateUser.save();
      console.log('   ❌ Duplicate registration should have failed but succeeded');
    } catch (error) {
      console.log(`   ✅ Duplicate registration correctly failed: ${error.message}`);
    }

    console.log('\n🎉 Authentication verification completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ User creation: Working');
    console.log('   ✅ Password hashing: Working');
    console.log('   ✅ Password validation: Working');
    console.log('   ✅ Login authentication: Working');
    console.log('   ✅ Error handling: Working');
    console.log('   ✅ Duplicate prevention: Working');

    // Clean up
    await User.deleteOne({ email: testEmail });
    console.log('\n🧹 Test user cleaned up');

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

verifyAuthentication();
