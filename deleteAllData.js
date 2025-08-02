// deleteAllData.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./db.js";

// 🧠 استورد كل الموديلات اللي في مشروعك
import User from "./models/usermodel.js";
// import Course from "./models/Course.js";
// import Enrollment from "./models/Enrollment.js";
 

dotenv.config();

const deleteAllData = async () => {
  try {
    await connectDB();
 
    await User.deleteMany();
    // await Course.deleteMany();
    // await Enrollment.deleteMany();

    console.log("✅ All data deleted from the database.");
    process.exit(0); // Exit success
  } catch (err) {
    console.error("❌ Error deleting data:", err);
    process.exit(1); // Exit with failure
  }
};

deleteAllData();
