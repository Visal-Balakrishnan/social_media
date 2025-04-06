import React, { useEffect } from "react";
import { formatDistanceToNow } from "date-fns"; // ✅ Import date-fns

const PostModal = ({ post, onClose }) => {
  if (!post) return null;

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-center p-4">
      <div className="bg-white w-4/5 max-w-3xl p-6 rounded-lg relative shadow-lg max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-3xl text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          ✖
        </button>

        {/* User Info */}
        <div className="flex items-center space-x-3">
          <img
            src={post.user?.profilePic?.url || "/default-avatar.png"}
            alt="User"
            className="w-12 h-12 rounded-full"
          />
          <div>
            <p className="font-semibold text-lg">{post.user?.name || "Unknown User"}</p>
            <p className="text-gray-500 text-sm">
              {post.createdAt
                ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) // ✅ Converts timestamp
                : "Unknown time"}
            </p>
          </div>
        </div>

        {/* Post Content */}
        <p className="mt-4 text-gray-800 text-lg">{post.text}</p>

        {/* Enlarged Image */}
        {post.image && (
          <img src={post.image} alt="Post" className="w-full mt-4 rounded-md shadow-md" />
        )}

        {/* Like, Comment, Share Buttons */}
        <div className="flex justify-between mt-4 text-gray-500 border-t pt-3">
          <button className="flex items-center space-x-1 hover:text-blue-500">
            👍 <span>Like</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-blue-500">
            💬 <span>Comment</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-blue-500">
            🔄 <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
