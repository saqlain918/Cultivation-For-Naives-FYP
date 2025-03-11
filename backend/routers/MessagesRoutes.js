import express from "express";
import ChatUserData from "../models/chatuserdata.js"; // Import the correct model
import Message from "../models/MessagesModel.js";
const router = express.Router();

// Get all contacts with initial unread message count and online status
// Mounted at /api/messages/contacts
router.get("/contacts", async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const users = await ChatUserData.find().select("-__v"); // Use ChatUserData
    const contactsWithCounts = await Promise.all(
      users.map(async (user) => {
        const unreadCount = await Message.countDocuments({
          sender: user._id,
          recipient: userId,
          status: "sent",
        });
        return {
          ...user.toObject(),
          unreadCount,
          online: false, // Initial status; updated via Socket.IO
        };
      })
    );

    res.json(contactsWithCounts);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch contacts", details: error.message });
  }
});

// Get messages between two users and mark as read
// Mounted at /api/messages/:userId/:recipientId
router.get("/:userId/:recipientId", async (req, res) => {
  try {
    const { userId, recipientId } = req.params;

    await Message.updateMany(
      { sender: recipientId, recipient: userId, status: "sent" },
      { $set: { status: "read" } }
    );

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId },
      ],
    })
      .populate("sender", "name avatar") // References ChatUserData
      .populate("recipient", "name avatar") // References ChatUserData
      .sort("createdAt");

    res.json(messages);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch messages", details: error.message });
  }
});

// Send a message (handled via Socket.IO in server.js, but keep this for REST API)
// Mounted at /api/messages
router.post("/", async (req, res) => {
  try {
    const { sender, recipient, text, type, uri, time } = req.body;

    if (!sender || !recipient || (!text && !uri) || !time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const message = new Message({
      sender,
      recipient,
      text,
      type: type || "text",
      uri,
      time,
      status: "sent",
    });

    await message.save();
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name avatar") // References ChatUserData
      .populate("recipient", "name avatar"); // References ChatUserData

    res.status(201).json(populatedMessage);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to send message", details: error.message });
  }
});

export default router;
