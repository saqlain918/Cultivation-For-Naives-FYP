import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["disease", "weather"], default: "disease" }, // Default for backward compatibility
    crop: {
      type: String,
      enum: ["Sugarcane", "Wheat", "Cotton", "Rice", "Maize"],
    },
    disease: { type: String },
    region: { type: String, required: true },
    message: { type: String, required: true },
    weatherCondition: { type: String },
  },
  { collection: "alerts", timestamps: true }
);

export default mongoose.model("Alert", alertSchema);
