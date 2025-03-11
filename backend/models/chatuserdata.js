import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  avatar: {
    type: String,
    default: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  online: { type: Boolean, default: false },
  email: { type: String, unique: true, required: true }, // Added for unique identification
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ChatUserData", userSchema);
