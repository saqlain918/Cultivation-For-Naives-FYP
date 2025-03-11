// models/Feedback.js
import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  expertId: { type: String, required: true }, // Changed to String
  userId: { type: String, required: false },
  message: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Feedback", feedbackSchema);
