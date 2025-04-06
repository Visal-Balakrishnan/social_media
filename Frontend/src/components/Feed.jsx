import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPosts, createPost } from "../redux/postSlice";
import { useNavigate } from "react-router-dom";
import Post from "./Post";
import { FaPhotoVideo } from "react-icons/fa";
import { toast } from "react-toastify";

const Feed = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { feed, loading: postsLoading, error: postsError } = useSelector((state) => state.posts);
  const { user, status: authStatus, isAuthenticated } = useSelector((state) => state.auth);
  const [optimisticPosts, setOptimisticPosts] = useState([]);
  const [postText, setPostText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // 🔹 Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated && authStatus !== "loading") {
      navigate("/login");
    } else if (isAuthenticated && user) {
      dispatch(fetchAllPosts());
    }
  }, [dispatch, user, navigate, isAuthenticated, authStatus]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postText && !image) {
      toast.error("Post must have text or an image!");
      return;
    }

    const tempPost = {
      _id: Date.now().toString(),
      user: { _id: user._id, name: user.name, profilePic: user.profilePic },
      text: postText,
      image: preview,
      likes: [],
      createdAt: new Date(),
    };
    setOptimisticPosts((prev) => [tempPost, ...prev]);

    try {
      await dispatch(createPost({ text: postText, image, token: localStorage.getItem("token") })).unwrap();
      toast.success("Post created successfully!");
      setPostText("");
      setImage(null);
      setPreview(null);
      await dispatch(fetchAllPosts());
      setOptimisticPosts([]);
    } catch (error) {
      toast.error(error || "Failed to create post.");
      setOptimisticPosts((prev) => prev.filter((p) => p._id !== tempPost._id));
    }
  };

  const allPosts = [...optimisticPosts, ...(feed || [])];

  // Wait for auth status to resolve
  if (authStatus === "loading") {
    return <div>Loading user...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return null; // The useEffect will handle the redirect
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 🔹 Create Post Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mt-4">
        <div className="flex items-center space-x-3">
          <img
            src={user?.profilePic?.url || "/default-avatar.png"}
            alt="User"
            className="w-10 h-10 rounded-full object-cover"
          />
          <input
            type="text"
            placeholder="What's on your mind?"
            className="w-full p-2 border rounded-full focus:outline-none bg-gray-100"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />
        </div>

        {preview && <img src={preview} alt="Preview" className="w-full rounded-md mt-3" />}

        <div className="flex justify-around mt-3 text-gray-600">
          <label className="flex items-center space-x-2 hover:text-blue-600 cursor-pointer">
            <FaPhotoVideo className="text-green-500" />
            <span>Photo</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        <button
          onClick={handlePostSubmit}
          className={`bg-blue-600 text-white px-4 py-2 rounded-full w-full mt-3 ${
            postsLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
          disabled={postsLoading}
        >
          {postsLoading ? "Posting..." : "Post"}
        </button>
      </div>

      {/* 🔹 Posts */}
      <div className="space-y-6 mt-4">
        {postsLoading && !allPosts.length ? (
          <p className="text-gray-500 text-center">Loading posts...</p>
        ) : allPosts.length > 0 ? (
          allPosts.map((post) => <Post key={post._id} post={post} />)
        ) : (
          <p className="text-gray-500 text-center">No posts available</p>
        )}
      </div>
    </div>
  );
};

export default Feed;