import bcrypt from "bcryptjs"; // Import bcrypt
import jwt from "jsonwebtoken";
import { Admin } from "../models/adminModel.js";
import { User } from "../models/userModel.js";
import Comment from "../models/commentModels.js";
import Post from "../models/postModels.js";
import asyncHandler from "express-async-handler";

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    // Check if admin exists
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SEC,
      { expiresIn: "7d" }
    );

    // Send token as a cookie
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.json({ message: "Admin logged in successfully", token, admin });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const adminLogout = (req, res) => {
  res.clearCookie("adminToken"); // Remove token
  res.json({ message: "Admin logged out successfully" });
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude passwords
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
};

export const getReportedPosts = async (req, res) => {
  try {
    const reportedPosts = await Post.find({ reports: { $exists: true, $not: { $size: 0 } } })
      .populate("user", "name profilePic")
      .sort({ createdAt: -1 });

    console.log("Fetched reported posts:", reportedPosts);
    res.status(200).json(reportedPosts);

  } catch (error) {
    console.error("Error fetching reported posts:", error);  // Log the error
    res.status(500).json({ message: "Failed to fetch reported posts" });
  }
};

// Delete a Reported Post
export const deleteReportedPost = async (req, res) => {
  const { postId } = req.params;
  try {
    const deletedPost = await Post.findByIdAndDelete(postId);
    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete post" });
  }
};



// Get Users with More Than 60% Negative Comments
export const getNegativeSentimentUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    console.log(`Total Users Found: ${users.length}`);

    const usersWithNegativeSentiment = await Promise.all(
      users.map(async (user) => {
        const totalComments = await Comment.countDocuments({ user: user._id });
        const negativeComments = await Comment.countDocuments({
          user: user._id,
          sentiment: "negative",
        });

        console.log(`User: ${user.name}, Total Comments: ${totalComments}, Negative Comments: ${negativeComments}`);

        const negativePercentage =
          totalComments > 0 ? (negativeComments / totalComments) * 100 : 0;

        return negativePercentage >= 60
          ? { _id: user._id, name: user.name, email: user.email, negativePercentage ,profilePic:user.profilePic.url }
          : null;
      })
    );

    const filteredUsers = usersWithNegativeSentiment.filter(Boolean);

    console.log("Filtered Users:", filteredUsers); // Debugging log

    res.json(filteredUsers);
  } catch (error) {
    console.error("Error fetching sentiment report:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});