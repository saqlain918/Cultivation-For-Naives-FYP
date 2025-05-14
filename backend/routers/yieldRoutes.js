import express from "express";
import {
  getCrops,
  saveYieldEstimation,
} from "../controllers/yieldController.js";

const router = express.Router();

router.get("/crops", getCrops);
router.post("/estimate-yield", saveYieldEstimation);

export default router;
