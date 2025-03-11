import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/user-model.js";
import dotenv from 'dotenv';

dotenv.config();

mongoose
  .connect("mongodb://127.0.0.1:27017/zarisa", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

const createAdminUser = async () => {
  try {
    // Delete existing admin if any
    await User.deleteOne({ email: "admin@example.com" });

    // Create admin user with all required fields
    const adminUser = new User({
      name: "Admin",
      email: "admin@example.com",
      password: "Admin@123", // Will be hashed by pre-save hook
      isAdmin: true,
      type: "admin",
      // Required fields as per schema
      age: 30,
      gender: "male",
      address: "Admin Address",
      phoneNumber: 1234567890,
      cnic: 1234512345671, // As number
      // Optional fields
      farmSize: 0,
      rating: "5"
    });

    await adminUser.save();
    console.log("Admin user created successfully!");
    
    // Verify the user was created
    const createdUser = await User.findOne({ email: "admin@example.com" });
    console.log("Created user:", {
      email: createdUser.email,
      isAdmin: createdUser.isAdmin,
      type: createdUser.type
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error("Error creating admin user:", error);
    mongoose.connection.close();
  }
};

createAdminUser(); 