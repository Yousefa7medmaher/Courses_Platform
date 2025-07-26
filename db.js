/**
 * Connects to the MongoDB database using Mongoose.
 *
 * @function connectDB
 * @returns {Promise<void>} Resolves when the connection is successful.
 * @throws Will exit the process if the connection fails.
 *
 * Environment Variables:
 * @param {string} process.env.MONGO_URI - The MongoDB connection string.
 *
 * Usage:
 *   import connectDB from './db.js';
 *   connectDB();
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
