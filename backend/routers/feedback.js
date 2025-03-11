// routers/feedback.js
import express from "express";
import {
  submitFeedback,
  getExpertFeedback,
} from "../controllers/feedbackController.js";

const router = express.Router();

// POST: Submit feedback for an expert
router.post("/", submitFeedback);

// GET: Retrieve all feedback for a specific expert
router.get("/expert/:expertId", getExpertFeedback);

export default router;
