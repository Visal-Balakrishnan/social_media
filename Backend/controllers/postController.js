import Post from "../models/postModels.js";
import { User } from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import asyncHandler from "express-async-handler";
import cloudinary from "cloudinary";
import getDataUrl from "../utils/urlGenerator.js";

// @desc Create a post
// @route POST /api/posts
// @access Private
export const createPost = asyncHandler(async (req, res) => {
  try {
    console.log("Received Post Request:", req.body);
    console.log("Received File:", req.file);
    console.log("Authenticated User:", req.user);

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - No user found" });
    }

    const userId = req.user._id;
    const { text } = req.body;
    const file = req.file;

    if (!text && !file) {
      return res.status(400).json({ message: "Post must have text or an image." });
    }

    let imageUrl = null;
    let imageId = null;

    if (file) {
      const fileUrl = getDataUrl(file);
      const uploadedImage = await cloudinary.v2.uploader.upload(fileUrl.content);
      imageUrl = uploadedImage.secure_url;
      imageId = uploadedImage.public_id;
      console.log("Image uploaded:", imageUrl);
    }

    const post = await Post.create({
      user: userId,
      text: text || "",
      image: imageUrl || null,
    });

    console.log("Post saved to DB:", post);
    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    console.error("Post creation error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc Get posts of logged-in user
// @route GET /api/posts/user
// @access Private
export const getUserPosts = asyncHandler(async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - No user found" });
    }

    const userId = req.user._id;
    console.log("Fetching posts for user:", userId);

    const posts = await Post.find({ user: userId })
      .populate("user", "name profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc Get all posts (Feed)
// @route GET /api/posts
// @access Private
export const getAllPosts = asyncHandler(async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching feed posts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc Like or Unlike a post
// @route POST /api/posts/:postId/like
// @access Private
export const likePost = asyncHandler(async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - No user found" });
    }

    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId).populate("user", "name profilePic");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString()); // Unlike
    } else {
      post.likes.push(userId); // Like

      // 🔹 Send notification if the liker is not the post owner
      if (userId.toString() !== post.user._id.toString()) {
        await Notification.create({
          type: "like",
          sender: userId,
          receiver: post.user._id,
          post: post._id,
          message: `${req.user.name} liked your post.`,
        });
      }
    }

    await post.save();

    res.json({
      message: isLiked ? "Post unliked" : "Post liked",
      likes: post.likes,
    });
  } catch (error) {
    console.error("Like Post Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id; // User from auth middleware

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const reportPost = async (req, res) => {
  const { postId } = req.params;
  const { reason } = req.body;
  const userId = req.user.id; // From authMiddleware

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check if user already reported
    const alreadyReported = post.reports.find(report => report.user.toString() === userId);
    if (alreadyReported) return res.status(400).json({ message: "You have already reported this post" });

    // Add report
    post.reports.push({ user: userId, reason });
    await post.save();

    res.json({ message: "Post reported successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate("user", "name profilePic")
      .populate("reports.user", "name"); // Populating the user who reported (optional)

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};