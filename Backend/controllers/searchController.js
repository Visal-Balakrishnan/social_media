import asyncHandler from "express-async-handler";
import { User } from "../models/userModel.js";

// @desc   Search for users by name or username
// @route  GET /api/search
// @access Private
export const searchUsers = asyncHandler(async (req, res) => {
    console.log("Query Received:", req.query); // Debugging
  
    const { q } = req.query;
  
    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }
  
    try {
      const users = await User.find({
        $or: [
          { name: { $regex: q, $options: "i" } },
          { username: { $regex: q, $options: "i" } },
        ],
      }).select("name username profilePic");
  
      res.status(200).json({ users });
    } catch (error) {
      console.error("Search Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  