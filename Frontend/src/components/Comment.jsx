import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addComment } from "../redux/commentSlice";

const Comment = ({ postId, comments }) => {
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state) => state.auth.user);
  const [commentText, setCommentText] = useState("");

  const handleCommentSubmit = (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    const newComment = {
      postId,
      text: commentText,
      user: {
        _id: loggedInUser._id,
        name: loggedInUser.name,
        profilePic: loggedInUser.profilePic?.url,
      },
    };

    console.log("Dispatching addComment:", newComment); // Debugging line

    dispatch(addComment(newComment));
    setCommentText("");
  };

  return (
    <div className="mt-2">
      {/* Input for new comment */}
      <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
        <img
          src={loggedInUser?.profilePic?.url || "/default-avatar.png"}
          alt="User"
          className="w-8 h-8 rounded-full object-cover"
        />
        <input
          type="text"
          placeholder="Write a comment..."
          className="w-full border p-2 rounded-full bg-gray-100 focus:outline-none"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded-lg">
          Post
        </button>
      </form>

      {/* Display Comments */}
      <div className="mt-3">
        {comments?.map((comment) => (
          <div key={comment._id} className="flex items-start space-x-2 mt-2">
            <img
              src={comment.user?.profilePic || "/default-avatar.png"}
              alt="User"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="bg-gray-100 p-2 rounded-lg">
              <p className="font-semibold">{comment.user.name}</p>
              <p>{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comment;
