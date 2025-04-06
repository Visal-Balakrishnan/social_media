import express from "express";
import { createPost, getUserPosts,getAllPosts,likePost,deletePost,getPostById } from "../controllers/postController.js";
import authMiddleware  from "../middlewares/authMiddleware.js";
import multer from "multer"; // For handling image uploads
import { reportPost } from "../controllers/postController.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();
const upload = multer(); // Using memory storage (Cloudinary integration needed)

router.post("/", authMiddleware, upload.single("image"), createPost); // Create post
router.get("/user", authMiddleware, getUserPosts);
router.get("/",authMiddleware, getAllPosts);
router.put("/:postId/like", authMiddleware, likePost);
router.delete("/:postId", authMiddleware, deletePost);
router.post("/:postId/report", authMiddleware, reportPost);
router.get("/:id", adminMiddleware, getPostById);

export default router;
