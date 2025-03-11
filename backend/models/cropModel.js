import mongoose from "mongoose";

// Define the schema for crop data
const cropSchema = new mongoose.Schema({
  province: { type: String, required: true }, // Province
  season: { type: String, required: true }, // Season
  crop: { type: String, required: true }, // Crop
});

// Create and export the model
const Crop = mongoose.model("Crop", cropSchema);
export default Crop;
