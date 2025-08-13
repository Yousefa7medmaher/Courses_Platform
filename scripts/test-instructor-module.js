import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/usermodel.js';
import CourseModel from '../models/coursemodel.js';

// Load environment variables
dotenv.config();

async function testInstructorModule() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🧪 Testing Instructor Module Setup...\n');

    // Step 1: Create or find an instructor user
    console.log('1️⃣ Setting up instructor user...');
    
    let instructor = await User.findOne({ email: 'instructor@test.com' });
    
    if (!instructor) {
      instructor = new User({
        name: 'Test Instructor',
        email: 'instructor@test.com',
        password: 'instructor123',
        role: 'instructor',
        authType: 'local'
      });
      await instructor.save();
      console.log('   ✅ Created instructor user: instructor@test.com');
    } else {
      console.log('   ✅ Found existing instructor user: instructor@test.com');
    }

    // Step 2: Create some test courses for the instructor
    console.log('\n2️⃣ Creating test courses...');
    
    // Clean up existing test courses
    await CourseModel.deleteMany({ 
      instructor: instructor._id,
      title: { $regex: /^Test Course/ }
    });

    const testCourses = [
      {
        title: 'Test Course 1 - JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript programming language with hands-on examples and projects.',
        category: 'Development',
        level: 'Beginner',
        price: 49.99,
        duration: 8.5,
        status: 'published',
        instructor: instructor._id,
        tags: ['javascript', 'programming', 'web development'],
        featured: true
      },
      {
        title: 'Test Course 2 - Advanced React',
        description: 'Master advanced React concepts including hooks, context, and performance optimization.',
        category: 'Development',
        level: 'Advanced',
        price: 89.99,
        duration: 12.0,
        status: 'draft',
        instructor: instructor._id,
        tags: ['react', 'javascript', 'frontend'],
        featured: false
      },
      {
        title: 'Test Course 3 - Node.js Backend',
        description: 'Build scalable backend applications with Node.js, Express, and MongoDB.',
        category: 'Development',
        level: 'Intermediate',
        price: 69.99,
        duration: 10.5,
        status: 'pending',
        instructor: instructor._id,
        tags: ['nodejs', 'backend', 'mongodb'],
        featured: false
      }
    ];

    const createdCourses = [];
    for (const courseData of testCourses) {
      const course = new CourseModel(courseData);
      await course.save();
      createdCourses.push(course);
      console.log(`   ✅ Created course: ${course.title}`);
    }

    // Step 3: Test instructor service methods
    console.log('\n3️⃣ Testing instructor service methods...');
    
    try {
      const { default: instructorService } = await import('../services/instructorService.js');
      
      // Test dashboard data
      console.log('   📊 Testing dashboard data...');
      const dashboardData = await instructorService.getDashboardData(instructor._id.toString());
      console.log(`   ✅ Dashboard data retrieved - ${dashboardData.stats.totalCourses} courses found`);
      
      // Test get instructor courses
      console.log('   📚 Testing get instructor courses...');
      const coursesResult = await instructorService.getInstructorCourses(
        instructor._id.toString(),
        { status: 'published' },
        { page: 1, limit: 10 }
      );
      console.log(`   ✅ Courses retrieved - ${coursesResult.courses.length} published courses`);
      
      // Test course details
      console.log('   📖 Testing course details...');
      const courseDetails = await instructorService.getCourseDetails(
        createdCourses[0]._id.toString(),
        instructor._id.toString()
      );
      console.log(`   ✅ Course details retrieved for: ${courseDetails.course.title}`);
      
    } catch (error) {
      console.log(`   ❌ Service test failed: ${error.message}`);
    }

    // Step 4: Display test credentials and URLs
    console.log('\n🎯 Test Setup Complete!\n');
    
    console.log('📋 Test Credentials:');
    console.log(`   Email: instructor@test.com`);
    console.log(`   Password: instructor123`);
    console.log(`   Role: instructor`);
    
    console.log('\n🔗 Test URLs:');
    console.log(`   Instructor Dashboard: https://localhost:5011/instructor/dashboard`);
    console.log(`   My Courses: https://localhost:5011/instructor/courses`);
    console.log(`   Create Course: https://localhost:5011/instructor/courses/new`);
    
    if (createdCourses.length > 0) {
      console.log(`   Edit Course: https://localhost:5011/instructor/courses/${createdCourses[0]._id}/edit`);
      console.log(`   Course Details: https://localhost:5011/instructor/courses/${createdCourses[0]._id}`);
    }
    
    console.log('\n📊 Test Data Summary:');
    console.log(`   Instructor ID: ${instructor._id}`);
    console.log(`   Total Courses Created: ${createdCourses.length}`);
    console.log(`   Published Courses: ${createdCourses.filter(c => c.status === 'published').length}`);
    console.log(`   Draft Courses: ${createdCourses.filter(c => c.status === 'draft').length}`);
    console.log(`   Pending Courses: ${createdCourses.filter(c => c.status === 'pending').length}`);
    
    console.log('\n✅ Instructor Module Test Complete!');
    console.log('🚀 You can now test the instructor functionality in the browser.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

async function cleanupTestData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🧹 Cleaning up instructor test data...');
    
    // Find instructor
    const instructor = await User.findOne({ email: 'instructor@test.com' });
    
    if (instructor) {
      // Delete test courses
      const deletedCourses = await CourseModel.deleteMany({ 
        instructor: instructor._id,
        title: { $regex: /^Test Course/ }
      });
      console.log(`   🗑️  Deleted ${deletedCourses.deletedCount} test courses`);
      
      // Delete instructor user
      await User.deleteOne({ email: 'instructor@test.com' });
      console.log('   🗑️  Deleted instructor user');
    }
    
    console.log('✅ Cleanup complete!');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Check command line arguments
const command = process.argv[2];

if (command === 'setup') {
  console.log('🔧 Setting up instructor module test data...\n');
  testInstructorModule();
} else if (command === 'cleanup') {
  console.log('🧹 Cleaning up instructor test data...\n');
  cleanupTestData();
} else {
  console.log('Usage:');
  console.log('  node scripts/test-instructor-module.js setup   - Set up test data and test the module');
  console.log('  node scripts/test-instructor-module.js cleanup - Clean up test data');
  process.exit(1);
}
