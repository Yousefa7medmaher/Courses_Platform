#!/usr/bin/env node

/**
 * Quick Database Reset Script
 * Quickly deletes all data and seeds basic data without prompts (for development)
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

class QuickReset {
    async connect() {
        try {
            const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/joocourses';
            console.log(`🔌 Attempting to connect to: ${mongoURI}`);

            // Set connection timeout
            await mongoose.connect(mongoURI, {
                serverSelectionTimeoutMS: 5000, // 5 second timeout
                connectTimeoutMS: 10000, // 10 second timeout
            });

            console.log('✅ Connected to MongoDB');
            return true;
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error.message);
            console.error('💡 Make sure MongoDB is running on your system');
            return false;
        }
    }

    async disconnect() {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }

    async deleteAllData() {
        console.log('🗑️ Deleting all data...');

        try {
            // Delete all documents from main collections
            const userResult = await User.deleteMany({});
            const courseResult = await Course.deleteMany({});

            console.log(`✅ Deleted ${userResult.deletedCount} users`);
            console.log(`✅ Deleted ${courseResult.deletedCount} courses`);
            
            // Clear any other collections
            const db = mongoose.connection.db;
            const collections = await db.listCollections().toArray();
            
            for (const collection of collections) {
                const collectionName = collection.name;
                if (!collectionName.startsWith('system.')) {
                    await db.collection(collectionName).deleteMany({});
                }
            }
            
            console.log('✅ All data deleted');
        } catch (error) {
            console.error('❌ Error deleting data:', error.message);
            throw error;
        }
    }

    async seedBasicData() {
        console.log('🌱 Seeding basic data...');
        
        try {
            // Create admin user
            const admin = new User({
                name: 'Admin User',
                email: 'admin@joocourses.com',
                password: 'admin123',
                role: 'admin',
                isVerified: true
            });
            await admin.save();

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

            // Create student
            const student = new User({
                name: 'Jane Student',
                email: 'student@joocourses.com',
                password: 'student123',
                role: 'student',
                isVerified: true
            });
            await student.save();

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

            console.log('✅ Basic data seeded successfully');
            console.log(`✅ Created ${courses.length} sample courses`);
            
        } catch (error) {
            console.error('❌ Error seeding data:', error.message);
            throw error;
        }
    }

    async run() {
        console.log('⚡ Quick Database Reset');
        console.log('======================\n');

        const connected = await this.connect();
        if (!connected) {
            console.log('\n❌ Cannot proceed without database connection');
            process.exit(1);
        }

        try {
            await this.deleteAllData();
            await this.seedBasicData();

            console.log('\n✨ Quick reset completed successfully!');
            console.log('\n🔑 Login Credentials:');
            console.log('Admin: admin@joocourses.com / admin123');
            console.log('Instructor: instructor@joocourses.com / instructor123');
            console.log('Student: student@joocourses.com / student123');

        } catch (error) {
            console.error('❌ Reset failed:', error.message);
            console.error('Stack trace:', error.stack);
            process.exit(1);
        } finally {
            await this.disconnect();
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🚀 Starting Quick Reset Script...');
    const reset = new QuickReset();
    reset.run().catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
}

export default QuickReset;
