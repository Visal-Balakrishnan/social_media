import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import { adminLogin,adminLogout,getAllUsers,deleteUser,getReportedPosts,deleteReportedPost } from "../controllers/adminController.js";
import { getNegativeSentimentUsers } from "../controllers/adminController.js";

const router = express.Router();
router.post("/login", adminLogin); 
// ✅ Admin-only route (protected)
router.get("/dashboard", authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: "Welcome to the admin dashboard!" });
});

router.post("/logout", adminLogout);

router.get("/users", adminMiddleware, getAllUsers); // Get all users
router.delete("/users/:id", adminMiddleware, deleteUser); // Delete a user

router.get("/reported-posts", adminMiddleware, getReportedPosts);
router.delete("/reported-posts/:postId", adminMiddleware, deleteReportedPost);

router.put("/reported-posts/:postId/mark-safe", async (req, res) => {
  try {
    const postId = req.params.postId;
    
    // Remove reports from the post
    await Post.findByIdAndUpdate(postId, { $set: { reports: [] } });

    res.json({ success: true, message: "Post marked as safe." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.get("/sentiment-report", getNegativeSentimentUsers);
export default router;
