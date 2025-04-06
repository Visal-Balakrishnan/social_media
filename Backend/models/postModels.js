import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user who created the post
    text: { type: String, trim: true },
    image: { type: String }, // Cloudinary image URL
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of users who liked the post
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    reports: [{ 
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reason: { type: String, required: true },
      date: { type: Date, default: Date.now }
    }],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
