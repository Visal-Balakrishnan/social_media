import Chat from "../models/chatModel.js";
import asyncHandler from "express-async-handler";

// @desc   Create or get a chat between two users
// @route  POST /api/chats
// @access Private
export const createOrGetChat = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.body;
    const loggedInUserId = req.user._id;

    if (!userId) return res.status(400).json({ message: "User ID is required" });

    let chat = await Chat.findOne({
      members: { $all: [loggedInUserId, userId] },
    });

    if (!chat) {
      chat = await Chat.create({ members: [loggedInUserId, userId] });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Chat creation error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc   Get all chats for logged-in user
// @route  GET /api/chats
// @access Private
export const getUserChats = asyncHandler(async (req, res) => {
  try {
    const chats = await Chat.find({ members: req.user._id }).populate("members", "name profilePic");

    res.json(chats);
  } catch (error) {
    console.error("Error fetching user chats:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
