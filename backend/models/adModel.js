import mongoose from "mongoose";

// Define the schema for the advertisement
const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String, // Stores the path to the image file
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the model based on the schema
const Ad = mongoose.model("Ad", adSchema);

export default Ad;
