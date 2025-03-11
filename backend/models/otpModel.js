// models/otpModel.js

class OTPModel {
  static otpStore = {}; // In-memory store (consider using Redis in production)

  static storeOTP(email, otp) {
    OTPModel.otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 }; // OTP expires in 10 minutes
  }

  static getOTP(email) {
    const otpData = OTPModel.otpStore[email];
    if (otpData && otpData.expiresAt > Date.now()) {
      return otpData.otp;
    }
    return null;
  }

  static deleteOTP(email) {
    delete OTPModel.otpStore[email];
  }
}

export default OTPModel;
