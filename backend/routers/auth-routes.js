import express from "express";
import {
  login,
  signup,
  updateProfile,
  getProfileData,
  getAllUsers,
  deleteUser,
  getExpertUsers,
  emailget,
} from "../controllers/auth-controllers.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/get-profile", getProfileData);
router.post("/update-profile", updateProfile);
router.get("/get-all-users", getAllUsers);
router.get("/get-expert-users", getExpertUsers);
router.delete("/delete-user/:userId", deleteUser);
router.get("/type/:email", emailget);

export default router;
