import Alert from "../models/Alert.js";

export const addDiseaseAlert = async (req, res) => {
  try {
    const { crop, disease, region, message } = req.body;
    if (!crop || !disease || !region || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const alert = await Alert.create({
      type: "disease",
      crop,
      disease,
      region,
      message,
    });
    res.status(201).json(alert);
  } catch (error) {
    console.error("Error adding disease alert:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const addWeatherAlert = async (req, res) => {
  try {
    const { region, weatherCondition, message } = req.body;
    if (!region || !weatherCondition || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const alert = await Alert.create({
      type: "weather",
      region,
      weatherCondition,
      message,
    });
    res.status(201).json(alert);
  } catch (error) {
    console.error("Error adding weather alert:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    console.log("Fetched alerts:", alerts); // Debug log
    res.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ error: "Server error" });
  }
};
