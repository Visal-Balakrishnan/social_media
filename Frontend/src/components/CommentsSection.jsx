import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchComments, addComment } from "../redux/commentSlice";
import moment from "moment";

const CommentsSection = ({ postId }) => {
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state) => state.auth.user);
  const commentsByPost = useSelector((state) => state.comments.commentsByPost);
  const postComments = commentsByPost[postId] || []; // ✅ Ensure array

  const [commentText, setCommentText] = useState("");

  // Fetch comments when component mounts
  useEffect(() => {
    dispatch(fetchComments(postId));
  }, [dispatch, postId]);

  // Handle comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    dispatch(addComment({ postId, text: commentText }));
    setCommentText("");
  };

  return (
    <div className="mt-4 bg-gray-50 p-3 rounded-lg shadow-inner">
      <h3 className="text-gray-700 font-semibold mb-3">Comments</h3>

      {/* Add Comment Input */}
      <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2 mb-4">
        <img
          src={loggedInUser?.profilePic?.url || "/default-avatar.png"}
          alt="User"
          className="w-8 h-8 rounded-full object-cover"
        />
        <input
          type="text"
          placeholder="Write a comment..."
          className="w-full border p-2 rounded-full bg-white focus:outline-none shadow-sm"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded-lg shadow-md hover:bg-blue-600">
          Post
        </button>
      </form>

      {/* Comments List */}
      {postComments.length > 0 ? (
        <div className="space-y-3">
          {postComments.map((comment) => (
            <div key={comment._id} className="flex items-start space-x-3 p-3 rounded-lg shadow-sm bg-white">
              <img
                src={comment.user?.profilePic?.url || "/default-avatar.png"}
                alt="User"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-medium">{comment.user?.name || "Unknown"}</p>
                  <span className="text-gray-400 text-xs">{moment(comment.createdAt).fromNow()}</span>
                </div>
                <p className="text-gray-700">{comment.text}</p>

                {/* Sentiment Indicator */}
                {comment.sentiment && (
                  <span
                    className={`text-xs px-2 py-1 rounded-md mt-1 inline-block ${
                      comment.sentiment === "positive" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}
                  >
                    {comment.sentiment === "positive" ? "🟢 Positive" : "🔴 Negative"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
};

export default CommentsSection;
