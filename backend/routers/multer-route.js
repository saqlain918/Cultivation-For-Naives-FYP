const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/User"); // Import the User model

const router = express.Router();

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/profileDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile_pictures"); // Directory to save profile pictures
  },
  filename: function (req, file, cb) {
    const email = req.body.email; // Email from the request body
    const fileExtension = path.extname(file.originalname); // Extract file extension
    cb(null, email + fileExtension); // Use email as the filename
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, JPG, and PNG are allowed."));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/upload-profile-picture",
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const { name, email } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const profilePicturePath = req.file.path;

      // Save user information and profile picture URL to MongoDB
      const newUser = new User({
        name,
        email,
        profilePicture: profilePicturePath,
      });

      await newUser.save();

      res.status(200).json({
        message: "Profile picture uploaded and user saved successfully",
        user: newUser,
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "An error occurred", error: err.message });
    }
  }
);

module.exports = router;
