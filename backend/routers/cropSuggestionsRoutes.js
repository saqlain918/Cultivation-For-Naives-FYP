import express from "express";
import CropSuggestion from "../models/cropSuggestionModel.js"; // Import the crop suggestion model

const router = express.Router();

// GET route to fetch all crop suggestions
router.get("/get-all-suggestions", async (req, res) => {
  try {
    const suggestions = await CropSuggestion.find(); // Get all saved crop suggestions
    res.json(suggestions); // Return as response
  } catch (error) {
    console.error("Error fetching crop suggestions:", error);
    res.status(500).json({ message: "Failed to fetch crop suggestions." });
  }
});

export default router;
