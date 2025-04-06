import express from "express";
import { sendMessage, getChatMessages } from "../controllers/messageController.js";
import  authMiddleware  from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, sendMessage); // Send a message
router.get("/:chatId", authMiddleware, getChatMessages); // Get all messages for a chat

export default router;
