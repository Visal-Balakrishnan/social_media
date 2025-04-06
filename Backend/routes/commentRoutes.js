import express from "express";
import { addComment, getComments, deleteComment } from "../controllers/commentController.js";
import authMiddleware  from "../middlewares/authMiddleware.js";

const router = express.Router();

// Routes
router.post("/:postId", authMiddleware, addComment); // Add comment
router.get("/:postId", getComments); // Get comments for a post
router.delete("/:commentId", authMiddleware, deleteComment); // Delete comment

export default router;
