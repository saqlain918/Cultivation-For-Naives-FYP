import mongoose from "mongoose";

// Schema for crop suggestions
const cropSuggestionSchema = new mongoose.Schema(
  {
    province: { type: String, required: true },
    season: { type: String, required: true },
    bestCrop: { type: String, required: true }, // Only final best crop value
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// Create the model
const CropSuggestion = mongoose.model("CropSuggestion", cropSuggestionSchema);

export default CropSuggestion;
