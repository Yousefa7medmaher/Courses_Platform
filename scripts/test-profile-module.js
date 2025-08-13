import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/usermodel.js';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

async function testProfileModule() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🧪 Testing Profile Module Setup...\n');

    // Step 1: Create or find test users for different roles
    console.log('1️⃣ Setting up test users...');
    
    const testUsers = [
      {
        name: 'John Student',
        email: 'student@profile.test',
        password: 'student123',
        role: 'student',
        phone: '1234567890',
        bio: 'I am a passionate learner interested in web development and programming.',
        location: 'New York, USA'
      },
      {
        name: 'Jane Instructor',
        email: 'instructor@profile.test',
        password: 'instructor123',
        role: 'instructor',
        phone: '1987654321',
        bio: 'Experienced software developer and educator with 10+ years in the industry.',
        location: 'San Francisco, USA'
      },
      {
        name: 'Admin User',
        email: 'admin@profile.test',
        password: 'admin123',
        role: 'admin',
        phone: '1122334455',
        bio: 'Platform administrator ensuring smooth operations and user experience.',
        location: 'Seattle, USA'
      }
    ];

    const createdUsers = [];

    for (const userData of testUsers) {
      // Check if user already exists
      let user = await User.findOne({ email: userData.email });
      
      if (!user) {
        user = new User({
          ...userData,
          authType: 'local'
        });
        await user.save();
        console.log(`   ✅ Created ${userData.role} user: ${userData.email}`);
      } else {
        console.log(`   ✅ Found existing ${userData.role} user: ${userData.email}`);
      }
      
      createdUsers.push(user);
    }

    // Step 2: Test profile service methods
    console.log('\n2️⃣ Testing profile functionality...');
    
    try {
      const { default: profileController } = await import('../controllers/profileController.js');
      
      // Test profile completion calculation
      console.log('   📊 Testing profile completion calculation...');
      const student = createdUsers[0];
      const completion = profileController.calculateProfileCompletion(student);
      console.log(`   ✅ Profile completion calculated: ${completion}%`);
      
      // Test password validation (simulate)
      console.log('   🔐 Testing password validation...');
      const isValidPassword = await student.isPasswordValid('student123');
      console.log(`   ✅ Password validation: ${isValidPassword ? 'Valid' : 'Invalid'}`);
      
    } catch (error) {
      console.log(`   ❌ Service test failed: ${error.message}`);
    }

    // Step 3: Test profile data integrity
    console.log('\n3️⃣ Testing profile data integrity...');
    
    for (const user of createdUsers) {
      // Check required fields
      const hasRequiredFields = user.name && user.email && user.role;
      console.log(`   ✅ ${user.role} user has required fields: ${hasRequiredFields}`);
      
      // Check optional fields
      const hasOptionalFields = user.phone && user.bio && user.location;
      console.log(`   ✅ ${user.role} user has optional fields: ${hasOptionalFields}`);
      
      // Check password is hashed
      const isPasswordHashed = user.password && user.password.length > 20;
      console.log(`   ✅ ${user.role} user password is hashed: ${isPasswordHashed}`);
    }

    // Step 4: Display test credentials and URLs
    console.log('\n🎯 Profile Module Test Setup Complete!\n');
    
    console.log('📋 Test Credentials:');
    testUsers.forEach(userData => {
      console.log(`   ${userData.role.toUpperCase()}:`);
      console.log(`     Email: ${userData.email}`);
      console.log(`     Password: ${userData.password}`);
      console.log(`     Role: ${userData.role}`);
      console.log('');
    });
    
    console.log('🔗 Test URLs:');
    console.log('   Profile Page: https://localhost:5011/profile');
    console.log('   Profile API: https://localhost:5011/api/profile');
    console.log('   Photo Upload: https://localhost:5011/api/profile/photo');
    console.log('   Password Change: https://localhost:5011/api/profile/password');
    console.log('   User Stats: https://localhost:5011/api/profile/stats');
    
    console.log('\n📊 Test Data Summary:');
    console.log(`   Total Users Created: ${createdUsers.length}`);
    console.log(`   Students: ${createdUsers.filter(u => u.role === 'student').length}`);
    console.log(`   Instructors: ${createdUsers.filter(u => u.role === 'instructor').length}`);
    console.log(`   Admins: ${createdUsers.filter(u => u.role === 'admin').length}`);
    
    console.log('\n🧪 Profile Features to Test:');
    console.log('   ✅ View profile information');
    console.log('   ✅ Update personal information (name, phone, bio, location)');
    console.log('   ✅ Upload profile photo');
    console.log('   ✅ Change password with current password verification');
    console.log('   ✅ View user statistics');
    console.log('   ✅ Role-based profile features');
    
    console.log('\n✅ Profile Module Test Complete!');
    console.log('🚀 You can now test the profile functionality in the browser.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

async function cleanupProfileTestData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🧹 Cleaning up profile test data...');
    
    const testEmails = [
      'student@profile.test',
      'instructor@profile.test',
      'admin@profile.test'
    ];
    
    // Delete test users
    const deletedUsers = await User.deleteMany({ 
      email: { $in: testEmails }
    });
    console.log(`   🗑️  Deleted ${deletedUsers.deletedCount} test users`);
    
    console.log('✅ Cleanup complete!');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

async function testPasswordSecurity() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔐 Testing Password Security...\n');
    
    // Test password hashing
    console.log('1️⃣ Testing password hashing...');
    const plainPassword = 'testPassword123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log(`   ✅ Plain password: ${plainPassword}`);
    console.log(`   ✅ Hashed password: ${hashedPassword}`);
    console.log(`   ✅ Hash length: ${hashedPassword.length} characters`);
    
    // Test password comparison
    console.log('\n2️⃣ Testing password comparison...');
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    const isWrongMatch = await bcrypt.compare('wrongPassword', hashedPassword);
    console.log(`   ✅ Correct password match: ${isMatch}`);
    console.log(`   ✅ Wrong password match: ${isWrongMatch}`);
    
    // Test with user model
    console.log('\n3️⃣ Testing with User model...');
    const testUser = new User({
      name: 'Security Test User',
      email: 'security@test.com',
      password: plainPassword,
      role: 'student',
      authType: 'local'
    });
    
    await testUser.save();
    console.log('   ✅ User created with password');
    
    // Test password validation method
    const isValidPassword = await testUser.isPasswordValid(plainPassword);
    const isInvalidPassword = await testUser.isPasswordValid('wrongPassword');
    console.log(`   ✅ Valid password check: ${isValidPassword}`);
    console.log(`   ✅ Invalid password check: ${isInvalidPassword}`);
    
    // Cleanup
    await User.deleteOne({ email: 'security@test.com' });
    console.log('   ✅ Test user cleaned up');
    
    console.log('\n✅ Password Security Test Complete!');

  } catch (error) {
    console.error('❌ Security test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Check command line arguments
const command = process.argv[2];

if (command === 'setup') {
  console.log('🔧 Setting up profile module test data...\n');
  testProfileModule();
} else if (command === 'cleanup') {
  console.log('🧹 Cleaning up profile test data...\n');
  cleanupProfileTestData();
} else if (command === 'security') {
  console.log('🔐 Testing password security...\n');
  testPasswordSecurity();
} else {
  console.log('Usage:');
  console.log('  node scripts/test-profile-module.js setup    - Set up test data and test the module');
  console.log('  node scripts/test-profile-module.js cleanup  - Clean up test data');
  console.log('  node scripts/test-profile-module.js security - Test password security features');
  process.exit(1);
}
