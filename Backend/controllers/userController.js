import { User } from "../models/userModel.js";
import cloudinary from "cloudinary";
import getDataUrl from "../utils/urlGenerator.js";
import Post from "../models/postModels.js";
import Notification from "../models/notificationModel.js";

/* ✅ UPDATE COVER PHOTO */
export const updateCoverPhoto = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized - No user found" });

        const userId = req.user._id;
        if (!req.file) return res.status(400).json({ message: "File is required" });

        const fileUrl = getDataUrl(req.file);
        const uploadedImage = await cloudinary.v2.uploader.upload(fileUrl.content);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { coverPic: { url: uploadedImage.secure_url, id: uploadedImage.public_id } },
            { new: true }
        );

        res.json({ coverPic: updatedUser.coverPic });
    } catch (error) {
        console.error("❌ Error updating cover photo:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


/* ✅ UPDATE PROFILE INFO */
export const updateProfile = async (req, res) => {
    try {
        const { name, bio, removeProfilePic } = req.body;
        const file = req.file;

        console.log("req.body:", req.body);
        console.log("req.file:", req.file);

        // Validation
        if (!name || name.trim().length === 0) {
            console.log("Validation failed: Name is missing or empty");
            return res.status(400).json({ message: "Name is required" });
        }
        if (name.length > 50) {
            return res.status(400).json({ message: "Name must be less than 50 characters" });
        }
        if (bio && bio.length > 150) {
            return res.status(400).json({ message: "Bio must be less than 150 characters" });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Update profile information
        user.name = name;
        user.bio = bio;

        // Handle profile picture
        if (removeProfilePic === "true" && user.profilePic?.id) {
            await cloudinary.v2.uploader.destroy(user.profilePic.id);
            user.profilePic = null;
        } else if (file) {
            const fileUrl = getDataUrl(file);
            const uploadedImage = await cloudinary.v2.uploader.upload(fileUrl.content, {
                folder: "profile_pics",
                width: 150,
                height: 150,
                crop: "fill",
                quality: "auto",
            });

            if (user.profilePic?.id) {
                await cloudinary.v2.uploader.destroy(user.profilePic.id);
            }

            user.profilePic = { url: uploadedImage.secure_url, id: uploadedImage.public_id };
        }

        await user.save();

        // Notify followers about profile update with error handling
        const followers = user.followers;
        if (followers.length > 0) {
            await Promise.all(
                followers.map(async (followerId) => {
                    try {
                        await Notification.create({
                            type: "profile_update",
                            sender: req.user._id,
                            receiver: followerId,
                            message: `${user.name} updated their profile.`,
                        });
                    } catch (notificationError) {
                        console.error(`Failed to create notification for follower ${followerId}:`, notificationError);
                        // Continue with other notifications instead of failing the entire request
                    }
                })
            );
        }

        const updatedUser = await User.findById(req.user._id).select("-password").populate("followers", "name profilePic")
        .populate("following", "name profilePic");
        if (!updatedUser) {
            console.error("Failed to fetch updated user after save");
            return res.status(404).json({ message: "Updated user not found" });
        }

        res.status(200).json({ user: updatedUser });
    } catch (error) {
        console.error("❌ Profile update error:", error.message, error.stack);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
/* ✅ GET USER PROFILE */
export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .select("-password")
            .populate("followers", "name profilePic")
            .populate("following", "name profilePic");

        if (!user) return res.status(404).json({ message: "User not found" });
        //console.log("User:", user.following);
        const posts = await Post.find({ user: req.params.userId })
            .populate("user", "name profilePic")
            .sort({ createdAt: -1 });

        res.status(200).json({ user, posts });
    } catch (error) {
        console.error("❌ Error fetching user profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/* ✅ FOLLOW / UNFOLLOW USER */
// export const followUser = async (req, res) => {
//     try {
//         const userToFollow = await User.findById(req.params.id);
//         const currentUser = await User.findById(req.user._id);

//         if (!userToFollow || !currentUser) return res.status(404).json({ message: "User not found" });

//         if (req.user._id.toString() === req.params.id) {
//             return res.status(400).json({ message: "You cannot follow yourself" });
//         }

//         const isFollowing = userToFollow.followers.includes(currentUser._id);

//         if (isFollowing) {
//             // Unfollow
//             userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUser._id.toString());
//             currentUser.following = currentUser.following.filter(id => id.toString() !== userToFollow._id.toString());

//             await userToFollow.save();
//             await currentUser.save();

//             return res.json({
//                 message: "User unfollowed successfully",
//                 following: false,
//                 followers: userToFollow.followers,
//                 followingList: currentUser.following,
//             });
//         } else {
//             // Follow
//             userToFollow.followers.push(currentUser._id);
//             currentUser.following.push(userToFollow._id);

//             await userToFollow.save();
//             await currentUser.save();

//             // 🔹 Send follow notification
//             await Notification.create({
//                 type: "follow",
//                 sender: req.user._id,
//                 receiver: userToFollow._id,
//                 message: `${currentUser.name} started following you.`,
//             });

//             return res.json({
//                 message: "User followed successfully",
//                 following: true,
//                 followers: userToFollow.followers,
//                 followingList: currentUser.following,
//             });
//         }
//     } catch (error) {
//         console.error("❌ Follow/unfollow error:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// };

export const followUser = async (req, res) => {
    try {
        const userId = req.user._id; // Current user (from authMiddleware)
        const targetUserId = req.params.userId; // User to follow

        // Prevent following yourself
        if (userId.toString() === targetUserId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const user = await User.findById(userId);
        const targetUser = await User.findById(targetUserId);

        if (!user || !targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already following
        if (user.following.includes(targetUserId)) {
            return res.status(400).json({ message: "You are already following this user" });
        }

        // Update the following list of the current user
        user.following.push(targetUserId);
        await user.save();

        // Update the followers list of the target user
        targetUser.followers.push(userId);
        await targetUser.save();

        // Optional: Create a notification for the target user
        await Notification.create({
            type: "follow",
            sender: userId,
            receiver: targetUserId,
            message: `${user.name} started following you.`,
        });

        // Fetch the updated user data to return
        const updatedUser = await User.findById(userId)
            .select("-password")
            .populate("followers", "name profilePic")
            .populate("following", "name profilePic");

        res.status(200).json({ user: updatedUser, message: "Successfully followed user" });
    } catch (error) {
        console.error("❌ Error following user:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
    try {
        const userId = req.user._id; // Current user (from authMiddleware)
        const targetUserId = req.params.userId; // User to unfollow

        // Prevent unfollowing yourself
        if (userId.toString() === targetUserId) {
            return res.status(400).json({ message: "You cannot unfollow yourself" });
        }

        const user = await User.findById(userId);
        const targetUser = await User.findById(targetUserId);

        if (!user || !targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if not following
        if (!user.following.includes(targetUserId)) {
            return res.status(400).json({ message: "You are not following this user" });
        }

        // Remove from the following list of the current user
        user.following = user.following.filter(
            (id) => id.toString() !== targetUserId.toString()
        );
        await user.save();

        // Remove from the followers list of the target user
        targetUser.followers = targetUser.followers.filter(
            (id) => id.toString() !== userId.toString()
        );
        await targetUser.save();

        // Optional: Remove the follow notification (if it exists)
        await Notification.deleteOne({
            type: "follow",
            sender: userId,
            receiver: targetUserId,
        });

        // Fetch the updated user data to return
        const updatedUser = await User.findById(userId)
            .select("-password")
            .populate("followers", "name profilePic")
            .populate("following", "name profilePic");

        res.status(200).json({ user: updatedUser, message: "Successfully unfollowed user" });
    } catch (error) {
        console.error("❌ Error unfollowing user:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/* ✅ GET FOLLOWERS LIST */
export const getFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("followers", "name profilePic");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ followers: user.followers });
    } catch (error) {
        console.error("❌ Get followers error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/* ✅ GET FOLLOWING LIST */
export const getFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("following", "name profilePic");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ following: user.following });
    } catch (error) {
        console.error("❌ Get following error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query; // Get search query from request

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        // Search for users whose name matches the query (case-insensitive)
        const users = await User.find({
            name: { $regex: query, $options: "i" } // Case-insensitive search
        }).select("_id name profilePic");

        res.status(200).json({ users });
    } catch (error) {
        console.error("❌ Error searching users:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};