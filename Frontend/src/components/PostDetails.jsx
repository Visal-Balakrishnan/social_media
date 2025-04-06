import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PostDetails = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:7000/api/post/${postId}`, {
          withCredentials: true,
        });

        setPost(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Post not found");
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId]);

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition duration-200"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-bold text-gray-800">{post.text}</h2>

      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="mt-4 w-full rounded-lg object-cover"
        />
      )}

      <p className="text-gray-500 mt-2 text-sm">
        Posted by <strong>{post.user?.name || "Unknown"}</strong> on{" "}
        {new Date(post.createdAt).toLocaleDateString()}
      </p>

      {post.reports?.length > 0 ? (
        <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400 rounded">
          <h3 className="text-lg font-semibold text-red-600">Reported Issues</h3>
          <ul className="list-disc list-inside text-red-500">
            {post.reports.map((report, index) => (
              <li key={index}>{report.reason}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-600 mt-2">No reports found for this post.</p>
      )}
    </div>
  );
};

export default PostDetails;
