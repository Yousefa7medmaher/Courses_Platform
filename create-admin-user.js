// Script to create an admin user for testing
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import the actual User model
import User from './models/usermodel.js';

async function createAdminUser() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Role:', existingAdmin.role);
      console.log('📅 Created:', existingAdmin.createdAt);
      
      // Update to admin role if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
      }
      
      return existingAdmin;
    }

    // Create admin user (password will be hashed automatically by the model)
    console.log('👤 Creating admin user...');
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');

    // Also create a regular user for testing
    const existingUser = await User.findOne({ email: 'user@example.com' });

    if (!existingUser) {
      console.log('👤 Creating regular user for testing...');
      const regularUser = new User({
        name: 'Regular User',
        email: 'user@example.com',
        password: 'user123',
        role: 'student'
      });

      await regularUser.save();
      console.log('✅ Regular user created successfully!');
    }

    // Create an instructor user for testing
    const existingInstructor = await User.findOne({ email: 'instructor@example.com' });

    if (!existingInstructor) {
      console.log('👨‍🏫 Creating instructor user for testing...');
      const instructorUser = new User({
        name: 'Instructor User',
        email: 'instructor@example.com',
        password: 'instructor123',
        role: 'instructor'
      });

      await instructorUser.save();
      console.log('✅ Instructor user created successfully!');
    }

    console.log('\n📋 Test Users Created:');
    console.log('======================');
    console.log('🔑 Admin User:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('   Role: admin');
    console.log('');
    console.log('👤 Regular User:');
    console.log('   Email: user@example.com');
    console.log('   Password: user123');
    console.log('   Role: student');
    console.log('');
    console.log('👨‍🏫 Instructor User:');
    console.log('   Email: instructor@example.com');
    console.log('   Password: instructor123');
    console.log('   Role: instructor');

    return adminUser;

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.code === 11000) {
      console.log('💡 User with this email already exists');
    }
    
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createAdminUser()
    .then(() => {
      console.log('\n🎉 Admin user setup completed!');
      console.log('\n🧪 You can now run the admin access tests:');
      console.log('   node test-admin-access.js');
      console.log('\n🌐 Or visit the admin panel:');
      console.log('   https://localhost:5011/admin/dashboard');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Failed to create admin user:', error.message);
      process.exit(1);
    });
}

export default createAdminUser;
