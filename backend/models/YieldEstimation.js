import mongoose from "mongoose";

const yieldEstimationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  crop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Crop",
    required: true,
  },
  area_in_acres: {
    type: Number,
    required: true,
    min: 0,
  },
  plant_density: {
    type: Number,
    required: true,
    min: 0,
  },
  yield_per_plant: {
    type: Number,
    required: true,
    min: 0,
  },
  estimated_yield_kg: {
    type: Number,
    required: true,
    min: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("YieldEstimation", yieldEstimationSchema);
