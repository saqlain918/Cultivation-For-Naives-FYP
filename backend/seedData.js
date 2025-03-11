import mongoose from "mongoose";
import Crop from "./models/cropModel.js"; // Import the Crop model

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/FYPBackend", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Define the crop data you want to insert into the database
const cropData = [
  {
    province: "Punjab",
    season: "Summer",
    crop: "Rice",
  },

  {
    province: "Punjab",
    season: "Winter",
    crop: "Wheat",
  },
  {
    province: "Sindh",
    season: "Summer",
    crop: "Cotton",
  },
  {
    province: "Sindh",
    season: "Winter",
    crop: "Wheat",
  },
  {
    province: "KPK",
    season: "Summer",
    crop: "Maize",
  },
  {
    province: "KPK",
    season: "Winter",
    crop: "Wheat",
  },
  {
    province: "Balochistan",
    season: "Summer",
    crop: "Sugarcane",
  },
  {
    province: "Balochistan",
    season: "Winter",
    crop: "Wheat",
  },
];

// Function to insert the crop data into the database
const insertCropData = async () => {
  try {
    // Insert multiple documents into the Crop collection
    await Crop.insertMany(cropData);
    console.log("Data inserted successfully!");
    mongoose.connection.close(); // Close the connection after inserting the data
  } catch (err) {
    console.error("Error inserting data:", err);
    mongoose.connection.close(); // Close the connection in case of error
  }
};

// Call the function to insert data
insertCropData();
