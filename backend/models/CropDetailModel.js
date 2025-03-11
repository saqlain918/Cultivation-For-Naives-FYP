import mongoose from "mongoose";

const cropDetailSchema = new mongoose.Schema({
  crop: { type: String, required: true, unique: true },
  soilPreparation: { type: String, required: true },
  vehicleUsage: { type: String, required: true },
  growthTimeline: [
    {
      stageName: { type: String, required: true },
      description: { type: String, required: true },
    },
  ],
  fertilizer: { type: String, required: true },
  waterInfo: { type: String, required: true },
}); // Custom collection name

export default mongoose.model("Cropdetail", cropDetailSchema);
