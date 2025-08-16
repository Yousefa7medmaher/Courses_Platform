#!/usr/bin/env node

/**
 * Database Reset Script
 * Deletes all data from the database and provides options to reseed with fresh data
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';
import { fileURLToPath } from 'url';
import path from 'path';

// Import models
import User from '../models/usermodel.js';
import Course from '../models/coursemodel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

class DatabaseResetter {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async connect() {
        try {
            const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/joocourses';
            await mongoose.connect(mongoURI);
            console.log('✅ Connected to MongoDB');
            return true;
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error.message);
            return false;
        }
    }

    async disconnect() {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }

    async confirmAction(message) {
        return new Promise((resolve) => {
            this.rl.question(`${message} (yes/no): `, (answer) => {
                resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
            });
        });
    }

    async showDatabaseStats() {
        console.log('\n📊 Current Database Statistics:');
        console.log('================================');
        
        try {
            const userCount = await User.countDocuments();
            const courseCount = await Course.countDocuments();

            console.log(`👥 Users: ${userCount}`);
            console.log(`📚 Courses: ${courseCount}`);
            console.log(`📊 Total Documents: ${userCount + courseCount}`);
        } catch (error) {
            console.error('❌ Error fetching database stats:', error.message);
        }
        
        console.log('================================\n');
    }

    async deleteAllData() {
        console.log('🗑️ Starting database cleanup...');
        
        const collections = [
            { name: 'Users', model: User },
            { name: 'Courses', model: Course }
        ];

        let totalDeleted = 0;

        for (const collection of collections) {
            try {
                const result = await collection.model.deleteMany({});
                console.log(`✅ Deleted ${result.deletedCount} ${collection.name.toLowerCase()}`);
                totalDeleted += result.deletedCount;
            } catch (error) {
                console.error(`❌ Error deleting ${collection.name.toLowerCase()}:`, error.message);
            }
        }

        // Clear any additional collections that might exist
        try {
            const db = mongoose.connection.db;
            const collections = await db.listCollections().toArray();
            
            for (const collection of collections) {
                const collectionName = collection.name;
                
                // Skip system collections
                if (!collectionName.startsWith('system.')) {
                    try {
                        await db.collection(collectionName).deleteMany({});
                        console.log(`✅ Cleared collection: ${collectionName}`);
                    } catch (error) {
                        console.log(`⚠️ Could not clear ${collectionName}: ${error.message}`);
                    }
                }
            }
        } catch (error) {
            console.log('⚠️ Could not list collections:', error.message);
        }

        console.log(`\n🎯 Total documents deleted: ${totalDeleted}`);
        return totalDeleted;
    }

    async resetIndexes() {
        console.log('🔄 Resetting database indexes...');
        
        try {
            // Drop and recreate indexes for each model
            await User.collection.dropIndexes();
            await User.createIndexes();
            console.log('✅ User indexes reset');

            await Course.collection.dropIndexes();
            await Course.createIndexes();
            console.log('✅ Course indexes reset');

        } catch (error) {
            console.log('⚠️ Index reset warning:', error.message);
        }
    }

    async seedBasicData() {
        console.log('🌱 Seeding basic data...');
        
        try {
            // Create admin user
            const adminUser = new User({
                name: 'Admin User',
                email: 'admin@joocourses.com',
                password: 'admin123', // This will be hashed by the model
                role: 'admin',
                isVerified: true,
                createdAt: new Date()
            });
            await adminUser.save();
            console.log('✅ Created admin user (admin@joocourses.com / admin123)');

            // Create sample instructor
            const instructor = new User({
                name: 'John Instructor',
                email: 'instructor@joocourses.com',
                password: 'instructor123',
                role: 'instructor',
                isVerified: true,
                bio: 'Experienced developer and educator',
                createdAt: new Date()
            });
            await instructor.save();
            console.log('✅ Created instructor user (instructor@joocourses.com / instructor123)');

            // Create sample student
            const student = new User({
                name: 'Jane Student',
                email: 'student@joocourses.com',
                password: 'student123',
                role: 'student',
                isVerified: true,
                createdAt: new Date()
            });
            await student.save();
            console.log('✅ Created student user (student@joocourses.com / student123)');

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
                    featured: true,
                    createdAt: new Date()
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
                    featured: true,
                    createdAt: new Date()
                }
            ];

            for (const courseData of courses) {
                const course = new Course(courseData);
                await course.save();
            }
            console.log(`✅ Created ${courses.length} sample courses`);

            console.log('\n🎉 Basic data seeding completed!');
            
        } catch (error) {
            console.error('❌ Error seeding basic data:', error.message);
        }
    }

    async clearUploads() {
        const uploadsPath = path.join(__dirname, '../uploads');
        
        try {
            const fs = await import('fs/promises');
            
            // Check if uploads directory exists
            try {
                await fs.access(uploadsPath);
            } catch {
                console.log('📁 No uploads directory found');
                return;
            }

            // Read directory contents
            const files = await fs.readdir(uploadsPath);
            
            if (files.length === 0) {
                console.log('📁 Uploads directory is already empty');
                return;
            }

            let deletedCount = 0;
            for (const file of files) {
                try {
                    const filePath = path.join(uploadsPath, file);
                    const stats = await fs.stat(filePath);
                    
                    if (stats.isFile()) {
                        await fs.unlink(filePath);
                        deletedCount++;
                    }
                } catch (error) {
                    console.log(`⚠️ Could not delete file ${file}:`, error.message);
                }
            }
            
            console.log(`✅ Deleted ${deletedCount} uploaded files`);
            
        } catch (error) {
            console.log('⚠️ Could not clear uploads:', error.message);
        }
    }

    async run() {
        console.log('🔄 JooCourses Database Reset Tool');
        console.log('==================================\n');

        // Connect to database
        const connected = await this.connect();
        if (!connected) {
            this.rl.close();
            return;
        }

        try {
            // Show current stats
            await this.showDatabaseStats();

            // Confirm deletion
            const confirmDelete = await this.confirmAction('⚠️ This will DELETE ALL DATA in the database. Are you sure?');
            
            if (!confirmDelete) {
                console.log('❌ Operation cancelled');
                return;
            }

            // Double confirmation for safety
            const doubleConfirm = await this.confirmAction('🚨 FINAL WARNING: This action cannot be undone. Proceed?');
            
            if (!doubleConfirm) {
                console.log('❌ Operation cancelled');
                return;
            }

            // Delete all data
            await this.deleteAllData();

            // Reset indexes
            await this.resetIndexes();

            // Ask about clearing uploads
            const clearUploads = await this.confirmAction('🗂️ Do you want to clear uploaded files as well?');
            if (clearUploads) {
                await this.clearUploads();
            }

            // Ask about seeding basic data
            const seedData = await this.confirmAction('🌱 Do you want to seed basic data (admin, instructor, student, sample course)?');
            if (seedData) {
                await this.seedBasicData();
            }

            console.log('\n✨ Database reset completed successfully!');
            
            if (seedData) {
                console.log('\n🔑 Default Login Credentials:');
                console.log('Admin: admin@joocourses.com / admin123');
                console.log('Instructor: instructor@joocourses.com / instructor123');
                console.log('Student: student@joocourses.com / student123');
            }

        } catch (error) {
            console.error('❌ Error during reset:', error.message);
        } finally {
            await this.disconnect();
            this.rl.close();
        }
    }
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const resetter = new DatabaseResetter();
    
    // Handle Ctrl+C gracefully
    process.on('SIGINT', async () => {
        console.log('\n\n⚠️ Operation interrupted by user');
        await resetter.disconnect();
        resetter.rl.close();
        process.exit(0);
    });
    
    resetter.run().catch(console.error);
}

export default DatabaseResetter;
