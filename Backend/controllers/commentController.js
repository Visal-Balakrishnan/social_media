import Comment from "../models/commentModels.js";
import Post from "../models/postModels.js";
import axios from "axios";
const SENTIMENT_API_URL = "http://127.0.0.1:8000/predict";
// Add a comment
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { postId } = req.params;

    if (!text) return res.status(400).json({ error: "Comment cannot be empty" });

    // 🔹 Send comment text to FastAPI for sentiment analysis
    const sentimentResponse = await axios.post(SENTIMENT_API_URL, { text });
    const sentiment = sentimentResponse.data.sentiment; // "positive" or "negative"

    const comment = new Comment({
      post: postId,
      user: req.user._id,
      text,
      sentiment, // Store sentiment in DB
    });

    await comment.save();

    // Add comment ID to the post
    await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

// Get all comments for a post
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId })
      .populate("user", "name profilePic")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

export const deleteComment = async (req, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user._id; // Extract authenticated user ID
  
      // Find the comment
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
  
      // Check if the user owns the comment
      if (comment.user.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Unauthorized - You can only delete your own comment" });
      }
  
      // Delete the comment
      await Comment.findByIdAndDelete(commentId);
      
      await Post.findByIdAndUpdate(
        comment.post,
        { $pull: { comments: commentId } },
        { new: true } // Return the updated document
      );
  
      res.json({ message: "Comment deleted successfully", commentId });
    } catch (error) {
      console.error("Delete Comment Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
