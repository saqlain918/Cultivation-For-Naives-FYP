import mongoose from "mongoose";
import CropSuggestion from "./models/cropSuggestionModel.js"; // Adjust path based on your folder structure
import connectDB from "./db/connectDB.js"; // Adjust path as needed

const seedData = async () => {
  await connectDB(); // Connect to the database

  const cropData = [
    {
      crop: "Wheat",
      soilPreparation: "Plow the field 2-3 times and level it.",
      vehicleUsage: "Tractor for plowing, seed drill for sowing.",
      growthTimeline: [
        { stageName: "Germination", description: "7-10 days." },
        { stageName: "Tillering", description: "15-30 days." },
        { stageName: "Stem Elongation", description: "30-60 days." },
        { stageName: "Maturity", description: "120-140 days." },
      ],
      fertilizer: "DAP before sowing, Urea after germination.",
      waterInfo: "Needs 5-6 irrigations during the growing season.",
    },
    {
      crop: "Rice",
      soilPreparation: "Puddle the soil; make it soft and wet.",
      vehicleUsage: "Tractor or rotavator.",
      growthTimeline: [
        { stageName: "Germination", description: "5-7 days." },
        { stageName: "Tillering", description: "10-20 days." },
        { stageName: "Maturity", description: "100-120 days." },
      ],
      fertilizer: "DAP before transplanting, Urea in later stages.",
      waterInfo: "Continuous water supply, especially in early stages.",
    },
    {
      crop: "Corn",
      soilPreparation: "Deep plowing and leveling.",
      vehicleUsage: "Tractor for plowing.",
      growthTimeline: [
        { stageName: "Germination", description: "5-7 days." },
        { stageName: "Vegetative Stage", description: "7-30 days." },
        { stageName: "Maturity", description: "90-120 days." },
      ],
      fertilizer: "DAP at planting, Urea and SOP later.",
      waterInfo: "Water every 10-15 days.",
    },
    {
      crop: "Sugarcane",
      soilPreparation: "Deep plowing and add organic manure.",
      vehicleUsage: "Tractor and furrow opener.",
      growthTimeline: [
        { stageName: "Germination", description: "7-15 days." },
        { stageName: "Grand Growth", description: "60-150 days." },
        { stageName: "Maturity", description: "250-365 days." },
      ],
      fertilizer: "DAP at planting, Urea and Potash later.",
      waterInfo: "Water every 7-10 days.",
    },
    {
      crop: "Cotton",
      soilPreparation: "Deep plowing and adding compost.",
      vehicleUsage: "Tractor and seed planter.",
      growthTimeline: [
        { stageName: "Germination", description: "5-10 days." },
        { stageName: "Flowering", description: "40-70 days." },
        { stageName: "Maturity", description: "120-150 days." },
      ],
      fertilizer:
        "DAP at planting, Urea after germination, SOP during flowering.",
      waterInfo: "Requires 7-8 irrigations during the season.",
    },
  ];

  try {
    await CropSuggestion.deleteMany(); // Clear existing data
    await CropSuggestion.insertMany(cropData); // Insert new data
    console.log("Crop data seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("Error seeding crop data:", error);
    process.exit(1);
  }
};

seedData();
