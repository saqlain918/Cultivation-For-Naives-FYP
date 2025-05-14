import mongoose from "mongoose";

// Define the schema
const cropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  default_density: {
    type: Number,
    required: true,
    min: 0,
  },
  yield_per_plant: {
    type: Number,
    required: true,
    min: 0,
  },
});

// Prevent model redefinition by checking if it already exists
const Crop = mongoose.model("Crop-Yeild", cropSchema);

export default Crop;
