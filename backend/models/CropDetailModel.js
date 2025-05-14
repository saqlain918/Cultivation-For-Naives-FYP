import mongoose from "mongoose";

const cropDetailSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: [true, "Crop name is required"],
    unique: true,
    trim: true,
    index: { collation: { locale: "en", strength: 2 } }, // Case-insensitive index
  },
  soilPreparation: {
    type: String,
    required: [true, "Soil preparation details are required"],
    trim: true,
  },
  vehicleUsage: {
    type: String,
    required: [true, "Vehicle usage details are required"],
    trim: true,
  },
  growthTimeline: [
    {
      stageName: {
        type: String,
        required: [true, "Stage name is required"],
        trim: true,
      },
      description: {
        type: String,
        required: [true, "Stage description is required"],
        trim: true,
      },
    },
  ],
  fertilizer: {
    type: String,
    required: [true, "Fertilizer details are required"],
    trim: true,
  },
  waterInfo: {
    type: String,
    required: [true, "Watering information is required"],
    trim: true,
  },
  sowingTime: {
    type: String,
    required: [true, "Sowing time is required"],
    trim: true,
  },
});

export default mongoose.model("Cropdetail", cropDetailSchema);
