import express from "express";
import {
  addDiseaseAlert,
  addWeatherAlert,
  getAllAlerts,
} from "../controllers/alertController.js";

const router = express.Router();

router.post("/disease", addDiseaseAlert);
router.post("/weather", addWeatherAlert);
router.get("/", getAllAlerts);

export default router;
