// equipment-router.js
import express from "express";
import multer from "multer";
import {
  createEquipment,
  getAllEquipment,
  deleteEquipment,
  updateEquipment,
} from "../controllers/equipment-controllers.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/create", upload.single("image"), createEquipment);
router.get("/all", getAllEquipment);
router.delete("/:id", deleteEquipment);
router.put("/update/:id", upload.single("image"), updateEquipment);

export default router;
