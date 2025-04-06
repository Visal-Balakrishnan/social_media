import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Admin } from "../models/adminModel.js"; // Adjust path

const MONGO_URL = "mongodb://localhost:27017/MernSocial"; // Directly specify MongoDB URI

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URL, { dbName: "MernSocial" }); // Connect without .env
    console.log("✅ Connected to MongoDB");

    // Check if an admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@gmail.com" });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists!");
      process.exit();
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create new admin
    const admin = new Admin({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
    });

    await admin.save();
    console.log("✅ Admin Created Successfully!");
  } catch (error) {
    console.error("❌ Error Creating Admin:", error);
  } finally {
    mongoose.connection.close();
    process.exit();
  }
};

// Run the script
createAdmin();
