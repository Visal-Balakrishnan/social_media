import Comment from "../models/commentModels.js";
import asyncHandler from "express-async-handler";

// @desc   Get sentiment report for a user
// @route  GET /api/sentiment/:userId
// @access Private
export const getSentimentReport = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch comments made by the user
    const comments = await Comment.find({ user: userId });

    if (!comments.length) {
      return res.status(404).json({ message: "No comments found for this user" });
    }

    // Count positive and negative comments
    const sentimentStats = comments.reduce(
      (acc, comment) => {
        if (comment.sentiment === "positive") acc.positive++;
        else if (comment.sentiment === "negative") acc.negative++;
        return acc;
      },
      { positive: 0, negative: 0 }
    );

    res.json(sentimentStats);
  } catch (error) {
    console.error("Error fetching sentiment report:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
