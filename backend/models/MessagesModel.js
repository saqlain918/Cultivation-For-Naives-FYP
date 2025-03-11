import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatUserData",
    required: true,
  }, // Changed from "User" to "ChatUserData"
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatUserData",
    required: true,
  }, // Changed from "User" to "ChatUserData"
  text: { type: String },
  type: { type: String, default: "text", enum: ["text", "image"] }, // Support text or image
  uri: { type: String }, // For image messages
  time: { type: String, required: true }, // Store time as provided by frontend
  status: { type: String, default: "sent", enum: ["sending", "sent", "read"] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Message", messageSchema);
