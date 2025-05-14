import Crop from "../models/Crop.js";
import YieldEstimation from "../models/YieldEstimation.js";
import mongoose from "mongoose";

// Initialize default crops
const initializeCrops = async () => {
  const defaultCrops = [
    { name: "wheat", default_density: 250, yield_per_plant: 0.025 },
    { name: "rice", default_density: 150, yield_per_plant: 0.03 },
    { name: "cotton", default_density: 40, yield_per_plant: 0.05 },
    { name: "maize", default_density: 50, yield_per_plant: 0.15 },
    { name: "sugarcane", default_density: 10, yield_per_plant: 10.0 },
  ];

  try {
    const existingCrops = await Crop.countDocuments();
    if (existingCrops === 0) {
      await Crop.insertMany(defaultCrops);
      console.log("Default crops initialized in Crop-Yeild:", defaultCrops);
    } else {
      console.log("Crops already exist in Crop-Yeild, skipping initialization");
    }
  } catch (error) {
    console.error("Error initializing crops:", error.message, error.stack);
    throw error;
  }
};

// Get all crops
const getCrops = async (req, res) => {
  try {
    console.log("Querying Crop-Yeild collection");
    const crops = await Crop.find({});
    console.log("Crops retrieved from Crop-Yeild:", crops);
    if (crops.length === 0) {
      console.log("No crops found, initializing default crops");
      await initializeCrops();
      const initializedCrops = await Crop.find({});
      console.log("Initialized crops:", initializedCrops);
      return res.status(200).json(initializedCrops);
    }
    res.status(200).json(crops);
  } catch (error) {
    console.error(
      "Error fetching crops from Crop-Yeild:",
      error.message,
      error.stack
    );
    res
      .status(500)
      .json({ message: "Error fetching crops", error: error.message });
  }
};

// Save yield estimation
const saveYieldEstimation = async (req, res) => {
  const { cropName, areaAcres, plantDensity, yieldPerPlant, estimatedYield } =
    req.body;

  console.log("Received payload:", req.body);

  try {
    if (
      !cropName ||
      areaAcres == null ||
      plantDensity == null ||
      yieldPerPlant == null ||
      estimatedYield == null
    ) {
      console.error("Validation failed: Missing fields");
      return res.status(400).json({ message: "All fields are required" });
    }
    if (
      isNaN(areaAcres) ||
      areaAcres <= 0 ||
      isNaN(plantDensity) ||
      plantDensity <= 0 ||
      isNaN(yieldPerPlant) ||
      yieldPerPlant <= 0 ||
      isNaN(estimatedYield) ||
      estimatedYield <= 0
    ) {
      console.error("Validation failed: Invalid numeric inputs");
      return res
        .status(400)
        .json({ message: "All numeric inputs must be positive" });
    }

    let crop = await Crop.findOne({ name: cropName.toLowerCase() });
    if (!crop) {
      console.log(`Crop '${cropName}' not found in Crop-Yeild, creating it`);
      const defaultCrop = {
        wheat: { default_density: 250, yield_per_plant: 0.025 },
        rice: { default_density: 150, yield_per_plant: 0.03 },
        cotton: { default_density: 40, yield_per_plant: 0.05 },
        maize: { default_density: 50, yield_per_plant: 0.15 },
        sugarcane: { default_density: 10, yield_per_plant: 10.0 },
      }[cropName.toLowerCase()];
      if (defaultCrop) {
        crop = new Crop({
          name: cropName.toLowerCase(),
          default_density: defaultCrop.default_density,
          yield_per_plant: defaultCrop.yield_per_plant,
        });
        await crop.save();
        console.log("Created crop in Crop-Yeild:", crop);
      } else {
        return res
          .status(404)
          .json({ message: `Unsupported crop: ${cropName}` });
      }
    }

    const yieldEstimation = new YieldEstimation({
      user_id: null,
      crop_id: crop._id,
      area_in_acres: areaAcres,
      plant_density: plantDensity,
      yield_per_plant: yieldPerPlant,
      estimated_yield_kg: estimatedYield,
    });
    await yieldEstimation.save();
    console.log("Yield estimation saved in database:", yieldEstimation);

    res.status(200).json({
      estimatedYield: Math.round(estimatedYield),
      yieldTons: Math.round((estimatedYield / 1000) * 10) / 10,
      densityUsed: plantDensity,
      yieldPerPlantUsed: yieldPerPlant,
      areaAcres,
    });
  } catch (error) {
    console.error("Error saving yield:", error.message, error.stack);
    res
      .status(500)
      .json({ message: "Error saving yield", error: error.message });
  }
};

export { initializeCrops, getCrops, saveYieldEstimation };
