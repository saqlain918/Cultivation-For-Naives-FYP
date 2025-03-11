// controllers/emailController.js
import User from "../models/user-model.js";
import OTPModel from "../models/otpModel.js";
import EmailService from "../service/emailService.js";
import crypto from "crypto";

class EmailController {
  // Step 1: Send OTP to email
  static async sendOTP(req, res) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    try {
      // Step 1a: Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Step 1b: Generate a 6-digit OTP
      const otp = crypto.randomInt(100000, 999999).toString();

      // Step 1c: Store OTP in memory (cache)
      OTPModel.storeOTP(email, otp);

      // Step 1d: Send OTP to user's email
      await EmailService.sendOTPEmail(email, otp);

      return res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Failed to send OTP", error: error.message });
    }
  }

  static async sendOTPsign(req, res) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    try {
      // Step 1a: Generate a 6-digit OTP
      const otp = crypto.randomInt(100000, 999999).toString();

      // Step 1b: Store OTP in memory (cache) for later verification
      OTPModel.storeOTP(email, otp);

      // Step 1c: Send OTP to the provided email
      await EmailService.sendOTPEmail(email, otp);
      console.log("hello");
      return res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Failed to send OTP", error: error.message });
    }
  }

  // Step 2: Verify OTP
  static async verifyOTP(req, res) {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    try {
      // Step 2a: Retrieve OTP from cache
      const cachedOtp = OTPModel.getOTP(email);

      if (!cachedOtp) {
        return res
          .status(400)
          .json({ message: "OTP has expired or was not requested" });
      }

      // Step 2b: Verify OTP
      if (parseInt(otp) === parseInt(cachedOtp)) {
        return res.status(200).json({ message: "OTP verified successfully" });
      } else {
        return res.status(400).json({ message: "Invalid OTP" });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error verifying OTP", error: error.message });
    }
  }

  // Step 3: Reset Password
  static async resetPassword(req, res) {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email and new password are required" });
    }

    try {
      // Step 3a: Retrieve user from database
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Step 3b: Hash the new password
      user.password = newPassword;

      // Step 3c: Save updated user record (password will be hashed automatically)
      await user.save();

      // Step 3d: Clear OTP from cache
      OTPModel.deleteOTP(email);

      return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error resetting password", error: error.message });
    }
  }
}

export default EmailController;
