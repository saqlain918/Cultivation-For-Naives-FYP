// services/emailService.js

import nodemailer from "nodemailer";

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "f219255@cfd.nu.edu.pk",
    pass: "fqtb kujh yaak bqfd",
  },
});

class EmailService {
  static sendOTPEmail(email, otp) {
    const mailOptions = {
      from: "f219255@cfd.nu.edu.pk",
      to: email,
      subject: "Password Reset OTP",
      html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p>`,
    };

    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      });
    });
  }
}

export default EmailService;
