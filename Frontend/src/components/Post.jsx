import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchComments, addComment, deleteComment } from "../redux/commentSlice";
import { likePost, deletePost, reportPost } from "../redux/postSlice";
import { openPostModel } from "../redux/postModelSlice";
import { FaThumbsUp, FaCommentDots, FaEllipsisV, FaTrash, FaFlag, FaChartBar } from "react-icons/fa";
import { Link } from "react-router-dom";
import moment from "moment";

const Post = ({ post }) => {
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state) => state.auth.user);
  const commentsByPost = useSelector((state) => state.comments.commentsByPost);
  const postComments = commentsByPost[post._id] || [];

  // Local state for optimistic updates
  const [localPost, setLocalPost] = useState(post);

  // State
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSentimentModalOpen, setIsSentimentModalOpen] = useState(false);
  const [sentimentData, setSentimentData] = useState({ positive: 0, negative: 0 });

  // Defensive checks
  if (!localPost) {
    return <div>Loading post...</div>;
  }

  // Fetch comments when the component mounts
  useEffect(() => {
    dispatch(fetchComments(localPost._id));
  }, [dispatch, localPost._id]);

  // Sync localPost with prop changes
  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  // Calculate sentiment from stored data
  useEffect(() => {
    if (postComments.length > 0) {
      const sentimentCounts = postComments.reduce(
        (acc, comment) => {
          const sentiment = comment.sentiment === "positive" ? "positive" : "negative";
          acc[sentiment]++;
          return acc;
        },
        { positive: 0, negative: 0 }
      );
      setSentimentData(sentimentCounts);
    } else {
      setSentimentData({ positive: 0, negative: 0 });
    }
  }, [postComments]);

  const likes = Array.isArray(localPost.likes) ? localPost.likes : [];
  const comments = Array.isArray(localPost.comments) ? localPost.comments : [];
  const isLiked = loggedInUser ? likes.includes(loggedInUser._id) : false;
  const isOwner = loggedInUser && localPost.user && loggedInUser._id === localPost.user._id;

  const handleShowComments = () => {
    setShowComments(!showComments);
    // Removed fetchComments from here since it's now in useEffect
  };

  const handleLike = () => {
    if (!loggedInUser) {
      alert("Please log in to like a post.");
      return;
    }
    dispatch(likePost(localPost._id));
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!loggedInUser) {
      alert("Please log in to comment.");
      return;
    }
    if (!commentText.trim()) return;
    dispatch(addComment({ postId: localPost._id, text: commentText })).then((action) => {
      if (addComment.fulfilled.match(action)) {
        // Optimistically update comments array
        const newComment = action.payload; // Assuming payload is the new comment
        setLocalPost((prev) => ({
          ...prev,
          comments: [...prev.comments, newComment._id],
        }));
      }
    });
    setCommentText("");
  };

  const handleDeletePost = () => {
    if (!loggedInUser) {
      alert("Please log in to delete a post.");
      return;
    }
    dispatch(deletePost(localPost._id));
    setIsMenuOpen(false);
  };

  const handleReportPost = () => {
    if (!loggedInUser) {
      alert("You must be logged in to report a post.");
      return;
    }
    if (localPost.reports?.some((report) => report.user.toString() === loggedInUser._id)) {
      alert("You have already reported this post.");
      return;
    }
    setIsReportModalOpen(true);
    setIsMenuOpen(false);
  };

  const submitReport = () => {
    if (!reportReason.trim()) {
      alert("Please provide a reason for reporting.");
      return;
    }
    dispatch(reportPost({ postId: localPost._id, reason: reportReason }))
      .unwrap()
      .then(() => {
        alert("Post reported successfully!");
        setIsReportModalOpen(false);
        setReportReason("");
      })
      .catch((error) => {
        alert(error || "Error reporting the post.");
      });
  };

  const handleDeleteComment = (commentId) => {
    if (!loggedInUser) {
      alert("Please log in to delete a comment.");
      return;
    }
    dispatch(deleteComment(commentId)).then((action) => {
      if (deleteComment.fulfilled.match(action)) {
        // Optimistically update comments array
        setLocalPost((prev) => ({
          ...prev,
          comments: prev.comments.filter((id) => id.toString() !== commentId),
        }));
      }
    });
  };

  // Sentiment bar rendering
  const totalSentiments = sentimentData.positive + sentimentData.negative;
  const getSentimentPercentage = (count) => (totalSentiments ? (count / totalSentiments) * 100 : 0);

  return (
    <div className="bg-white shadow-lg rounded-lg p-5 mb-4 border border-gray-200 transition-all hover:shadow-xl">
      {/* User Info */}
      <div className="flex justify-between items-center">
        <Link to={`/profile/${localPost.user?._id}`} className="flex items-center space-x-3 hover:underline">
          <img
            src={localPost.user?.profilePic?.url || "/default-avatar.png"}
            alt="User"
            className="w-10 h-10 rounded-full object-cover border border-gray-300"
          />
          <div>
            <p className="font-semibold text-gray-800">{localPost.user?.name || "Unknown User"}</p>
            <p className="text-gray-500 text-sm">{moment(localPost.createdAt).fromNow()}</p>
          </div>
        </Link>

        {/* Three-Dot Menu */}
        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-gray-800">
            <FaEllipsisV />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-lg border border-gray-200 z-10">
              <ul className="py-2">
                {isOwner ? (
                  <li>
                    <button
                      onClick={handleDeletePost}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      <FaTrash />
                      <span>Delete Post</span>
                    </button>
                  </li>
                ) : (
                  <li>
                    <button
                      onClick={handleReportPost}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-yellow-600 hover:bg-gray-100"
                    >
                      <FaFlag />
                      <span>Report Post</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="mt-4 cursor-pointer" onClick={() => dispatch(openPostModel(localPost))}>
        {localPost.text && <p className="mt-2 text-gray-800">{localPost.text}</p>}
        {localPost.image && (
          <img src={localPost.image} alt="Post" className="rounded-lg mt-3 w-full object-cover shadow-sm" />
        )}
      </div>

      {/* Reactions */}
      <div className="mt-3 border-t pt-3 flex justify-around text-gray-600 text-sm">
        <button
          className={`flex items-center space-x-2 ${isLiked ? "text-blue-600" : "hover:text-blue-600"}`}
          onClick={handleLike}
        >
          <FaThumbsUp />
          <span>{likes.length} {likes.length === 1 ? "Like" : "Likes"}</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-blue-600" onClick={handleShowComments}>
          <FaCommentDots />
          <span>{comments.length} {comments.length === 1 ? "Comment" : "Comments"}</span>
        </button>
        <button
          className="flex items-center space-x-2 hover:text-blue-600"
          onClick={() => setIsSentimentModalOpen(true)}
        >
          <FaChartBar />
          <span>Sentiment</span>
        </button>
      </div>

      {/* Sentiment Overview */}
      {totalSentiments > 0 && (
        <div className="mt-2 flex items-center space-x-2">
          <div className="w-full bg-gray-200 rounded-full h-2 flex overflow-hidden">
            <div
              style={{ width: `${getSentimentPercentage(sentimentData.positive)}%` }}
              className="bg-green-500 h-full"
            ></div>
            <div
              style={{ width: `${getSentimentPercentage(sentimentData.negative)}%` }}
              className="bg-red-500 h-full"
            ></div>
          </div>
          <span className="text-xs text-gray-500">({sentimentData.positive}/{sentimentData.negative})</span>
        </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow-inner">
          <h3 className="text-gray-700 font-semibold mb-3">Comments</h3>
          <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3 mb-4">
            <img
              src={loggedInUser?.profilePic?.url || "/default-avatar.png"}
              alt="User"
              className="w-8 h-8 rounded-full object-cover"
            />
            <input
              type="text"
              placeholder="Write a comment..."
              className="w-full border px-3 py-2 rounded-full bg-white focus:outline-none shadow-sm"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600">
              Post
            </button>
          </form>
          {postComments.length > 0 ? (
            <div className="space-y-3">
              {postComments.map((comment) => (
                <div key={comment._id} className="flex justify-between items-start p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-start space-x-3">
                    <img
                      src={comment.user?.profilePic?.url || "/default-avatar.png"}
                      alt="User"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{comment.user?.name}</p>
                      <p className="text-gray-700">{comment.text}</p>
                      <span
                        className={`text-xs ${
                          comment.sentiment === "positive" ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {comment.sentiment}
                      </span>
                    </div>
                  </div>
                  {comment.user?._id === loggedInUser?._id && (
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No comments yet. Be the first to comment!</p>
          )}
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Post</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for reporting this post:</p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Enter your reason here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              rows="4"
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sentiment Report Modal */}
      {isSentimentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sentiment Report</h3>
            <p className="text-gray-600 mb-4">Analysis based on {postComments.length} comments:</p>
            {totalSentiments > 0 ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Positive ({sentimentData.positive})</p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      style={{ width: `${getSentimentPercentage(sentimentData.positive)}%` }}
                      className="bg-green-500 h-full rounded-full"
                    ></div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Negative ({sentimentData.negative})</p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      style={{ width: `${getSentimentPercentage(sentimentData.negative)}%` }}
                      className="bg-red-500 h-full rounded-full"
                    ></div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  Overall Sentiment: {sentimentData.positive > sentimentData.negative ? "Positive" : "Negative"}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No comments available for sentiment analysis.</p>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsSentimentModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;