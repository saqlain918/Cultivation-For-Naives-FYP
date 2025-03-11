import express from "express";
import GroupChat from "../models/GroupChatModel.js";
import ChatUserData from "../models/chatuserdata.js";
const router = express.Router();

// Create a new group chat
router.post("/", async (req, res) => {
  const { title, description } = req.body;
  try {
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }
    const newGroupChat = await GroupChat.create({ title, description });
    res.status(201).json(newGroupChat);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create group chat",
      details: error.message,
    });
  }
});

// Fetch all group chats
router.get("/", async (req, res) => {
  try {
    const groupChats = await GroupChat.find().populate(
      "messages.sender",
      "name"
    );
    res.json(groupChats);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch group chats", details: error.message });
  }
});

// Get group chat details by ID (already defined)
router.get("/:id", async (req, res) => {
  try {
    const groupChat = await GroupChat.findById(req.params.id).populate(
      "messages.sender",
      "name"
    );
    if (!groupChat)
      return res.status(404).json({ error: "Group chat not found" });
    res.json(groupChat);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch group chat", details: error.message });
  }
});

// Post a message to a group chat (already defined)
router.post("/:id/messages", async (req, res) => {
  const { text, senderId } = req.body;
  try {
    if (!text || !senderId)
      return res.status(400).json({ error: "Text and senderId are required" });
    const groupChat = await GroupChat.findById(req.params.id);
    if (!groupChat)
      return res.status(404).json({ error: "Group chat not found" });
    const newMessage = {
      text,
      sender: senderId,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    groupChat.messages.push(newMessage);
    await groupChat.save();
    const updatedGroupChat = await GroupChat.findById(req.params.id).populate(
      "messages.sender",
      "name"
    );
    res.status(201).json(updatedGroupChat);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to send message", details: error.message });
  }
});

export default router;
