import express from "express";
import multer from "multer";
import {
  createAd,
  getAllAds,
  deleteAd,
  updateAd,
} from "../controllers/ad-controllers.js";

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Routes
router.post("/create", upload.single("image"), createAd);
router.get("/all", getAllAds);
router.delete("/:id", deleteAd);
router.put("/update/:id", upload.single("image"), updateAd);

export default router;
