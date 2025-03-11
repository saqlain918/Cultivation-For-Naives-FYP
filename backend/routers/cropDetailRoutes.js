import express from "express";
const router = express.Router();
import CropDetail from "../models/CropDetailModel.js"; // Correct import

// Route to add new crop details
router.post("/add", async (req, res) => {
  const {
    name,
    soilPreparation,
    vehicleUsage,
    growthTimeline,
    fertilizer,
    waterInfo,
  } = req.body;

  try {
    const newCrop = new CropDetail({
      name,
      soilPreparation,
      vehicleUsage,
      growthTimeline,
      fertilizer,
      waterInfo,
    });

    await newCrop.save();
    res
      .status(201)
      .json({ message: "Crop details added successfully!", crop: newCrop });
  } catch (error) {
    res.status(500).json({ message: "Error adding crop details", error });
  }
});

// Route to fetch crop details by name
router.post("/crop-info", async (req, res) => {
  const { crop } = req.body;

  try {
    const cropData = await CropDetail.findOne({ crop: crop });

    if (!cropData) {
      return res.status(404).json({ message: "Crop not found" });
    }

    res.status(200).json(cropData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching crop details", error });
  }
});

export default router;
