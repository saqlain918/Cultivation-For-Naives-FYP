import express from "express";
import Crop from "../models/cropModel.js"; // Adjust the path if necessary
import CropSuggestion from "../models/cropSuggestionModel.js";

const router = express.Router();

// POST route to save the crop suggestion
router.post("/crop", async (req, res) => {
  const { province, season, bestCrop } = req.body;

  // Validate input
  if (!province || !season || !bestCrop) {
    return res.status(400).json({
      message: "All fields are required: province, season, bestCrop.",
    });
  }

  try {
    // Ensure data is trimmed and consistent
    const newCrop = new Crop({
      province: province.trim(),
      season: season.trim(),
      crop: bestCrop.trim(),
    });

    await newCrop.save();
    res.status(201).json({ message: "Crop suggestion saved successfully." });
  } catch (error) {
    console.error("Error saving crop:", error);
    res.status(500).json({ message: "Failed to save crop suggestion." });
  }
});

// GET route to fetch the best crop suggestion
router.get("/get-best-crop", async (req, res) => {
  const { province, season } = req.query;

  // Validate query parameters
  if (!province || !season) {
    return res
      .status(400)
      .json({ message: "Both province and season are required." });
  }

  try {
    // console.log("Query Params:", { province, season }); // Log incoming query

    // Query database (case-insensitive and trimmed)
    const crop = await Crop.find({
      province: { $regex: new RegExp(`^${province.trim()}$`, "i") },
      season: { $regex: new RegExp(`^${season.trim()}$`, "i") },
    });

    if (crop) {
      res.json({ bestCrop: crop });
    } else {
      res
        .status(404)
        .json({ message: "No crop found for the given province and season." });
    }
  } catch (error) {
    console.error("Error fetching crop:", error);
    res.status(500).json({ message: "Failed to fetch crop suggestion." });
  }
});

router.post("/cropSuggestions", async (req, res) => {
  console.log("Request Body:", req.body); // Debugging log
  const { province, season, bestCrop } = req.body;

  if (!province || !season || !bestCrop) {
    return res.status(400).json({
      message: "Please provide province, season, and best crop.",
    });
  }

  try {
    const newCropSuggestion = new CropSuggestion({
      province: province.trim(),
      season: season.trim(),
      bestCrop: bestCrop.trim(),
    });

    await newCropSuggestion.save();
    res.status(201).json({ message: "Crop suggestion saved successfully." });
  } catch (error) {
    console.error("Error saving crop suggestion:", error);
    res.status(500).json({ message: "Failed to save crop suggestion." });
  }
});

export default router;
