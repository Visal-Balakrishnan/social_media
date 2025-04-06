import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchReportedPosts, deleteReportedPost, markPostAsSafe } from "../redux/reportedPostsSlice";
import { FaTrash, FaSpinner, FaEye, FaExclamationTriangle, FaUserCircle, FaCheckCircle } from "react-icons/fa"; // Added check icon

const ReportedPosts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reportedPosts = [], loading, error } = useSelector((state) => state.reportedPosts || {});

  useEffect(() => {
    dispatch(fetchReportedPosts());
  }, [dispatch]);

  const handleDelete = (postId) => {
    if (window.confirm("Are you sure you want to delete this reported post?")) {
      dispatch(deleteReportedPost(postId));
    }
  };

  const handleMarkSafe = (postId) => {
    if (window.confirm("Are you sure this post is not problematic?")) {
      dispatch(markPostAsSafe(postId));
    }
  };

  const handleViewPost = (postId) => {
    navigate(`/posts/${postId}`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <FaExclamationTriangle className="text-red-500" /> Reported Posts
      </h2>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center py-4">
          <FaSpinner className="text-blue-500 text-3xl animate-spin" />
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* No Reported Posts Message */}
      {!loading && (!Array.isArray(reportedPosts) || reportedPosts.length === 0) ? (
        <p className="text-gray-600 text-center text-lg">No reported posts found.</p>
      ) : (
        <div className="space-y-4">
          {reportedPosts.map((post) => (
            <div
              key={post._id}
              className="bg-gray-50 p-5 rounded-lg shadow hover:shadow-lg transition-all border-l-4 border-red-500"
            >
              {/* User Info */}
              <div className="flex items-center gap-4 mb-3">
                {post.user?.profilePic.url ? (
                  <img
                    src={post.user.profilePic.url}
                    alt="User"
                    className="w-10 h-10 rounded-full border"
                  />
                ) : (
                  <FaUserCircle className="text-gray-500 w-10 h-10" />
                )}
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    👤 {post.user?.name ? `@${post.user.name}` : "Unknown User"}
                  </p>
                  <p className="text-sm text-gray-600">
                    🚨 Reported <strong>{post.reports?.length || 0}</strong> times
                  </p>
                </div>
              </div>

              {/* Report Reason */}
              <p className="text-sm text-gray-600">
                <strong>Reason:</strong>{" "}
                {post.reports && post.reports.length > 0 ? post.reports[0].reason : "No reason provided"}
              </p>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-4 mt-4">
                {/* View Post Button */}
                <button
                  onClick={() => handleViewPost(post._id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg transition-all hover:bg-blue-600 flex items-center gap-2 shadow-md"
                >
                  <FaEye /> View Post
                </button>

                {/* Mark as Safe Button */}
                {/* <button
                  onClick={() => handleMarkSafe(post._id)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg transition-all hover:bg-green-600 flex items-center gap-2 shadow-md"
                >
                  <FaCheckCircle /> Mark as Safe
                </button> */}

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(post._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg transition-all hover:bg-red-600 flex items-center gap-2 shadow-md"
                >
                  <FaTrash /> Delete Post
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportedPosts;
