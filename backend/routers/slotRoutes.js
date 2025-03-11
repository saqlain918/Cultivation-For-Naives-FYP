import express from "express";
import {
  addSlot,
  getFreeSlots,
  updateSlot,
  deleteSlot,
  getExpertFreeSlots,
  bookSlot,
} from "../controllers/slotController.js";

const router = express.Router();

router.post("/add-slot", addSlot);
router.get("/free-slot", getFreeSlots);
router.put("/slot/:slotId", updateSlot);
router.delete("/slot/:slotId", deleteSlot);
router.get("/slot/expert/:expertId", getExpertFreeSlots); // New route
router.post("/slot/book", bookSlot); // New routez
export default router;
