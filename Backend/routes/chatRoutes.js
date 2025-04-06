import express from "express";
import { createOrGetChat, getUserChats } from "../controllers/chatController.js";
import  authMiddleware  from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createOrGetChat); // Create/Get a chat
router.get("/", authMiddleware, getUserChats); // Get all chats for logged-in user

export default router;
