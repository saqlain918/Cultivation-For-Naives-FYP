import Payment from "./routers/payment.js";
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import authRoutes from "./routers/auth-routes.js";
import adRoutes from "./routers/ad-routes.js";
import emailRoutes from "./routers/emailRoutes.js";
import suggRoutes from "./routers/cropRoutes.js";
import cropDetailRoutes from "./routers/cropDetailRoutes.js";
import equipmentRoutes from "./routers/equipmentRoutes.js";
import messageRouter from "./routers/MessagesRoutes.js";
import slotRoutes from "./routers/slotRoutes.js";
import feedbackRoutes from "./routers/feedback.js";
import groupChatRouter from "./routers/groupChatRouter.js";
import reportRoutes from "./routers/reportRoutes.js";
import yieldRoutes from "./routers/yieldRoutes.js";
import alert from "./routers/alerts.js";
import { initializeCrops } from "./controllers/yieldController.js"; // Added import
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import mongoose from "mongoose";

// Import weatherCheck.js with error handling
try {
  import("./scripts/weatherCheck.js").catch((err) => {
    console.error("Failed to import weatherCheck.js:", err.message);
  });
} catch (err) {
  console.error("Error loading weatherCheck.js:", err.message);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/crops", suggRoutes);
app.use("/api/crop-details", cropDetailRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/group-chats", groupChatRouter);
app.use("/api", slotRoutes);
app.use("/api/messages", messageRouter);
app.use("/api/ads", reportRoutes);
app.use("/api/payment", Payment);
app.use("/api/alert", alert);
app.use("/api/yeild", yieldRoutes);

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// Store online users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("onlineStatus", { userId, online: true });
    console.log(`User ${userId} is online`);
  });

  socket.on("sendMessage", async (message) => {
    try {
      const Message = mongoose.model("Message");
      const newMessage = new Message(message);
      await newMessage.save();

      const populatedMessage = await Message.findById(newMessage._id)
        .populate("sender", "name avatar")
        .populate("recipient", "name avatar");

      const recipientSocketId = onlineUsers.get(message.recipient);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("newMessage", populatedMessage);

        const unreadCount = await Message.countDocuments({
          sender: message.sender,
          recipient: message.recipient,
          status: "sent",
        });
        io.to(recipientSocketId).emit("unreadCountUpdate", {
          sender: message.sender,
          count: unreadCount,
        });
      }

      io.to(onlineUsers.get(message.sender)).emit(
        "newMessage",
        populatedMessage
      );
    } catch (error) {
      console.error("Error broadcasting message:", error);
    }
  });

  socket.on("typing", ({ sender, recipient }) => {
    const recipientSocketId = onlineUsers.get(recipient);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("typing", { sender, recipient });
    }
  });

  socket.on("disconnect", () => {
    const userId = [...onlineUsers.entries()].find(
      ([_, sid]) => sid === socket.id
    )?.[0];
    if (userId) {
      onlineUsers.delete(userId);
      io.emit("onlineStatus", { userId, online: false });
      console.log(`User ${userId} is offline`);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Start server with enhanced error handling
const startServer = async () => {
  try {
    await connectDB();
    await initializeCrops(); // Add this line
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
