#!/usr/bin/env node

/**
 * MongoDB Connection Check Script
 * Quickly checks if MongoDB is running and accessible
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkMongoDB() {
    console.log('🔍 Checking MongoDB Connection...');
    console.log('==================================\n');

    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/joocourses';
    console.log(`📍 Connection URI: ${mongoURI}`);

    try {
        console.log('🔌 Attempting to connect...');
        
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        });

        console.log('✅ MongoDB connection successful!');
        
        // Get database info
        const db = mongoose.connection.db;
        const admin = db.admin();
        const serverStatus = await admin.serverStatus();
        
        console.log('\n📊 Database Information:');
        console.log(`Database Name: ${db.databaseName}`);
        console.log(`MongoDB Version: ${serverStatus.version}`);
        console.log(`Host: ${serverStatus.host}`);
        console.log(`Uptime: ${Math.floor(serverStatus.uptime / 60)} minutes`);
        
        // Check collections
        const collections = await db.listCollections().toArray();
        console.log(`\n📚 Collections (${collections.length}):`);
        
        if (collections.length === 0) {
            console.log('  No collections found (empty database)');
        } else {
            for (const collection of collections) {
                const count = await db.collection(collection.name).countDocuments();
                console.log(`  - ${collection.name}: ${count} documents`);
            }
        }
        
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected successfully');
        
    } catch (error) {
        console.error('\n❌ MongoDB connection failed!');
        console.error(`Error: ${error.message}`);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Troubleshooting Tips:');
            console.log('1. Make sure MongoDB is installed and running');
            console.log('2. Check if MongoDB service is started:');
            console.log('   - Windows: Check Services or run "net start MongoDB"');
            console.log('   - macOS: brew services start mongodb-community');
            console.log('   - Linux: sudo systemctl start mongod');
            console.log('3. Verify the connection URI in your .env file');
            console.log('4. Check if MongoDB is running on the correct port (default: 27017)');
        } else if (error.message.includes('authentication')) {
            console.log('\n💡 Authentication Issue:');
            console.log('1. Check your MongoDB username and password');
            console.log('2. Verify the authentication database');
            console.log('3. Make sure the user has proper permissions');
        } else {
            console.log('\n💡 General Troubleshooting:');
            console.log('1. Check your network connection');
            console.log('2. Verify the MongoDB URI format');
            console.log('3. Check MongoDB logs for more details');
        }
        
        process.exit(1);
    }
}

// Run the check
checkMongoDB().catch(console.error);
