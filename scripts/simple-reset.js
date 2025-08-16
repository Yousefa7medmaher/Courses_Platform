#!/usr/bin/env node

/**
 * Simple Database Reset Script
 * A straightforward script to reset the database without classes
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Import models
import User from '../models/usermodel.js';
import Course from '../models/coursemodel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('⚡ Simple Database Reset');
console.log('========================\n');

async function resetDatabase() {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/joocourses';
        console.log(`🔌 Connecting to: ${mongoURI.replace(/\/\/.*@/, '//***:***@')}`);
        
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        });
        
        console.log('✅ Connected to MongoDB');

        // Delete all data
        console.log('\n🗑️ Deleting all data...');
        
        const userResult = await User.deleteMany({});
        console.log(`✅ Deleted ${userResult.deletedCount} users`);
        
        const courseResult = await Course.deleteMany({});
        console.log(`✅ Deleted ${courseResult.deletedCount} courses`);

        // Clear any other collections
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        for (const collection of collections) {
            const collectionName = collection.name;
            if (!collectionName.startsWith('system.')) {
                await db.collection(collectionName).deleteMany({});
                console.log(`✅ Cleared collection: ${collectionName}`);
            }
        }

        // Seed basic data
        console.log('\n🌱 Seeding basic data...');
        
        // Create admin user
        const admin = new User({
            name: 'Admin User',
            email: 'admin@joocourses.com',
            password: 'admin123',
            role: 'admin',
            isVerified: true
        });
        await admin.save();
        console.log('✅ Created admin user');

        // Create instructor
        const instructor = new User({
            name: 'John Instructor',
            email: 'instructor@joocourses.com',
            password: 'instructor123',
            role: 'instructor',
            isVerified: true,
            bio: 'Experienced developer and educator'
        });
        await instructor.save();
        console.log('✅ Created instructor user');

        // Create student
        const student = new User({
            name: 'Jane Student',
            email: 'student@joocourses.com',
            password: 'student123',
            role: 'student',
            isVerified: true
        });
        await student.save();
        console.log('✅ Created student user');

        // Create sample courses
        const courses = [
            {
                title: 'Introduction to Web Development',
                description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript.',
                category: 'Development',
                level: 'Beginner',
                price: 29.99,
                duration: 10,
                status: 'published',
                instructor: instructor._id,
                tags: ['web development', 'html', 'css', 'javascript'],
                featured: true
            },
            {
                title: 'Advanced React Development',
                description: 'Master React.js with hooks, context, and advanced patterns.',
                category: 'Development',
                level: 'Advanced',
                price: 49.99,
                duration: 15,
                status: 'published',
                instructor: instructor._id,
                tags: ['react', 'javascript', 'frontend'],
                featured: false
            },
            {
                title: 'UI/UX Design Fundamentals',
                description: 'Learn the principles of user interface and user experience design.',
                category: 'Design',
                level: 'Beginner',
                price: 39.99,
                duration: 12,
                status: 'published',
                instructor: instructor._id,
                tags: ['design', 'ui', 'ux', 'figma'],
                featured: true
            },
            {
                title: 'Digital Marketing Mastery',
                description: 'Complete guide to digital marketing strategies and tools.',
                category: 'Marketing',
                level: 'Intermediate',
                price: 34.99,
                duration: 8,
                status: 'published',
                instructor: instructor._id,
                tags: ['marketing', 'seo', 'social media'],
                featured: false
            },
            {
                title: 'Business Strategy & Planning',
                description: 'Learn how to create effective business strategies and plans.',
                category: 'Business',
                level: 'Intermediate',
                price: 44.99,
                duration: 14,
                status: 'published',
                instructor: instructor._id,
                tags: ['business', 'strategy', 'planning'],
                featured: false
            }
        ];

        for (const courseData of courses) {
            const course = new Course(courseData);
            await course.save();
        }
        
        console.log(`✅ Created ${courses.length} sample courses`);

        // Disconnect
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        
        console.log('\n✨ Database reset completed successfully!');
        console.log('\n🔑 Login Credentials:');
        console.log('Admin: admin@joocourses.com / admin123');
        console.log('Instructor: instructor@joocourses.com / instructor123');
        console.log('Student: student@joocourses.com / student123');
        
    } catch (error) {
        console.error('\n❌ Reset failed:', error.message);
        console.error('Stack trace:', error.stack);
        
        try {
            await mongoose.disconnect();
        } catch (disconnectError) {
            console.error('Failed to disconnect:', disconnectError.message);
        }
        
        process.exit(1);
    }
}

// Run the reset
resetDatabase();
