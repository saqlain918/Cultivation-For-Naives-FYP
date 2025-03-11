import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.DB_URI;

  // Validate DB_URI
  if (!uri) {
    console.error("Database URI is not defined in the environment variables.");
    process.exit(1); // Exit with failure
  }

  try {
    // Establish a connection
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to Database!");
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
    process.exit(1); // Exit with failure
  }
};

export default connectDB;
