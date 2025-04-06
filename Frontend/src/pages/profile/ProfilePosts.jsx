import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPost, fetchUserPosts } from "../../redux/postSlice";
import { toast } from "react-toastify";
import PostModal from "../../components/PostModel";
import Post from "../../components/Post"; // Import Post component

const ProfilePosts = () => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const dispatch = useDispatch();
  const { posts, loading, error } = useSelector((state) => state.posts || {});
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    dispatch(fetchUserPosts({ token }));
  }, [dispatch, token]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text && !image) {
      toast.error("Post must have text or an image!");
      return;
    }

    dispatch(createPost({ text, image, token }))
      .unwrap()
      .then(() => {
        toast.success("Post created successfully!");
        setText("");
        setImage(null);
        setPreview(null);
        dispatch(fetchUserPosts());
      })
      .catch((error) => {
        toast.error(error || "Failed to create post.");
      });
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      {/* Post Form */}
      <div className="bg-white p-4 rounded-md shadow-md mb-4">
        <h2 className="text-lg font-semibold mb-2">Create Post</h2>
        <div className="flex space-x-2 items-center">
          <img
            src={user?.profilePic?.url || "/default-avatar.png"}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <input
            type="text"
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />

        {preview && (
          <div className="mt-2">
            <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-md" />
          </div>
        )}

        <button
          type="submit"
          onClick={handleSubmit}
          className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg w-full"
          disabled={loading}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>

      {/* Posts Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-2">Recent Posts</h3>

        {loading ? (
          <p>Loading posts...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          posts.map((post) => <Post key={post._id} post={post} user={user} />) // ✅ Using Post.jsx
        )}
      </div>
    </div>
  );
};

export default ProfilePosts;
