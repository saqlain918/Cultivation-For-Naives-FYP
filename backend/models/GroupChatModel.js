import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatUserData",
    required: true,
  },
  timestamp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const groupChatSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("GroupChat", groupChatSchema);
