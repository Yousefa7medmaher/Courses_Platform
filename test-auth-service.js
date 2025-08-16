// Test authService to debug admin dashboard issues
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authService from './services/authService.js';
import CourseModel from './models/coursemodel.js';

dotenv.config();

async function testAuthService() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🧪 Testing authService.getAllUsers...');
    
    // Test 1: Get all users
    console.log('1. Getting all users...');
    const allUsersResult = await authService.getAllUsers({}, { page: 1, limit: 1 });
    console.log('All users result:', JSON.stringify(allUsersResult, null, 2));
    
    // Test 2: Get instructors
    console.log('\n2. Getting instructors...');
    const instructorsResult = await authService.getAllUsers({ role: 'instructor' }, { page: 1, limit: 1 });
    console.log('Instructors result:', JSON.stringify(instructorsResult, null, 2));
    
    // Test 3: Get recent users
    console.log('\n3. Getting recent users...');
    const recentUsersResult = await authService.getAllUsers({}, { page: 1, limit: 10 });
    console.log('Recent users result:', JSON.stringify(recentUsersResult, null, 2));
    
    // Test 4: Count courses
    console.log('\n4. Counting courses...');
    const totalCourses = await CourseModel.countDocuments();
    console.log('Total courses:', totalCourses);
    
    // Test 5: Simulate the admin dashboard Promise.all
    console.log('\n5. Testing Promise.all like in admin dashboard...');
    const [totalUsersResult, courseCount, totalInstructorsResult, recentUsers] = await Promise.all([
      authService.getAllUsers({}, { page: 1, limit: 1 }),
      CourseModel.countDocuments(),
      authService.getAllUsers({ role: 'instructor' }, { page: 1, limit: 1 }),
      authService.getAllUsers({}, { page: 1, limit: 10 })
    ]);
    
    console.log('Promise.all results:');
    console.log('- Total users result:', totalUsersResult);
    console.log('- Course count:', courseCount);
    console.log('- Total instructors result:', totalInstructorsResult);
    console.log('- Recent users count:', recentUsers.users?.length || 0);
    
    // Test 6: Try to access the properties like in the admin controller
    console.log('\n6. Testing property access...');
    console.log('totalUsersResult.pagination.totalUsers:', totalUsersResult.pagination?.totalUsers);
    console.log('totalInstructorsResult.pagination.totalUsers:', totalInstructorsResult.pagination?.totalUsers);
    
    const stats = {
      totalUsers: totalUsersResult.pagination.totalUsers,
      activeUsers: Math.floor(totalUsersResult.pagination.totalUsers * 0.85),
      totalInstructors: totalInstructorsResult.pagination.totalUsers,
      totalCourses: courseCount,
      pendingUsers: Math.floor(totalUsersResult.pagination.totalUsers * 0.05),
      pendingInstructors: Math.floor(totalInstructorsResult.pagination.totalUsers * 0.1),
      notifications: 3
    };
    
    console.log('Generated stats:', stats);
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

testAuthService();
