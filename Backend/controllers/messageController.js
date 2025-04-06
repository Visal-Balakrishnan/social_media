import Message from "../models/messageModel.js";
import asyncHandler from "express-async-handler";
import { io } from "../index.js";

// @desc   Send a message
// @route  POST /api/messages
// @access Private
export const sendMessage = asyncHandler(async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const senderId = req.user._id;

    if (!chatId || !text) {
      return res.status(400).json({ message: "Chat ID and text are required" });
    }

    const message = await Message.create({
      chatId,
      sender: senderId,
      text,
    });

    // Populate sender details
    const populatedMessage = await Message.findById(message._id).populate("sender", "name profilePic");

    // Emit message to the chat room
    io.to(chatId.toString()).emit("receiveMessage", populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc   Get all messages for a chat
// @route  GET /api/messages/:chatId
// @access Private
export const getChatMessages = asyncHandler(async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId: chatId }).populate("sender", "name profilePic");
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});