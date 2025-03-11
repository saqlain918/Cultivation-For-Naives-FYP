// routers/emailRoutes.js
import express from "express";
import EmailController from "../controllers/emailController.js";

const router = express.Router();

// Route to request OTP for password reset
router.post("/send-otp", EmailController.sendOTP);

router.post("/sendOTPsign", EmailController.sendOTPsign);

// Route to verify OTP
router.post("/verify-otp", EmailController.verifyOTP);

// Route to reset password after OTP verification
router.post("/reset-password", EmailController.resetPassword);

// Default export of router
export default router;
