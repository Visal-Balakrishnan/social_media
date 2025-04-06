import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { connectDb } from "./database/db.js";
import cloudinary from "cloudinary";
import cookieParser from "cookie-parser";
import Chat from "./models/chatModel.js";

dotenv.config();

// Cloudinary Config
cloudinary.v2.config({
  cloud_name: process.env.Cloudinary_Cloud_name,
  api_key: process.env.Cloudinary_Api,
  api_secret: process.env.Cloudinary_Secret,
});

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5174",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Import Routes
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import sentimentRoutes from "./routes/sentimentRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/sentiment", sentimentRoutes);

app.get("/", (req, res) => {
  res.send({ message: "Server is running" });
});

// Initialize Socket.io
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5174",
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Store online users
const onlineUsers = new Map();
console.log("🚀 Socket.IO server is initializing...");

io.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // User joins their own ID room and all their chat rooms
  socket.on("join", async (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`👤 User ${userId} connected with socket ID: ${socket.id}`);

    // Join all chats the user is a member of
    try {
      const chats = await Chat.find({ members: userId });
      chats.forEach((chat) => {
        socket.join(chat._id.toString());
        console.log(`👥 User ${userId} joined chat room: ${chat._id}`);
      });
    } catch (err) {
      console.error("⚠️ Error joining chat rooms:", err);
    }
  });

  // Handle message sending (no changes needed here, handled in controller)
  socket.on("sendMessage", (message) => {
    console.log(`📩 Message received on server: ${message.text}`);
    io.to(message.chatId).emit("receiveMessage", message); // Broadcast to chat room
  });

  // When a user disconnects
  socket.on("disconnect", () => {
    onlineUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
      }
    });
  });

  socket.on("error", (error) => {
    console.error("🚨 Socket Error:", error);
  });
});

// Start Server
const port = process.env.PORT || 7000;
server.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
  connectDb();
});