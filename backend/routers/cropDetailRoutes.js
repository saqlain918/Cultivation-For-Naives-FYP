import express from "express";
const router = express.Router();
import CropDetail from "../models/CropDetailModel.js";

// Route to add new crop details
router.post("/add", async (req, res) => {
  const {
    crop,
    soilPreparation,
    vehicleUsage,
    growthTimeline,
    fertilizer,
    waterInfo,
    sowingTime,
  } = req.body;

  // Validate required fields
  if (!crop) {
    return res.status(400).json({ message: "Crop name is required" });
  }
  if (!soilPreparation) {
    return res
      .status(400)
      .json({ message: "Soil preparation details are required" });
  }
  if (!vehicleUsage) {
    return res
      .status(400)
      .json({ message: "Vehicle usage details are required" });
  }
  if (!growthTimeline || growthTimeline.length === 0) {
    return res.status(400).json({ message: "Growth timeline is required" });
  }
  if (!fertilizer) {
    return res.status(400).json({ message: "Fertilizer details are required" });
  }
  if (!waterInfo) {
    return res
      .status(400)
      .json({ message: "Watering information is required" });
  }
  if (!sowingTime) {
    return res.status(400).json({ message: "Sowing time is required" });
  }

  try {
    const newCrop = new CropDetail({
      crop,
      soilPreparation,
      vehicleUsage,
      growthTimeline,
      fertilizer,
      waterInfo,
      sowingTime,
    });

    await newCrop.save();
    res
      .status(201)
      .json({ message: "Crop details added successfully!", crop: newCrop });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Crop name already exists" });
    }
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation failed", error: error.message });
    }
    res
      .status(500)
      .json({ message: "Error adding crop details", error: error.message });
  }
});

// Route to fetch crop details by name
router.post("/crop-info", async (req, res) => {
  const { crop } = req.body;

  if (!crop) {
    return res.status(400).json({ message: "Crop name is required" });
  }

  try {
    // Case-insensitive query
    const cropData = await CropDetail.findOne({
      crop: { $regex: new RegExp(`^${crop}$`, "i") },
    });

    if (!cropData) {
      return res.status(404).json({ message: "Crop not found" });
    }

    res.status(200).json(cropData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching crop details", error: error.message });
  }
});

export default router;
