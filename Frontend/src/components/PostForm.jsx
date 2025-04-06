import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../redux/postSlice";
import { toast } from "react-hot-toast";

const PostForm = () => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.posts);
  const token = useSelector((state) => state.auth.userToken); // Assuming auth state contains userToken

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text && !image) {
      toast.error("Post must have text or an image!");
      return;
    }

    const postData = { text, image, token };

    const result = await dispatch(createPost(postData));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Post created successfully!");
      setText("");
      setImage(null);
    } else {
      toast.error(result.payload || "Failed to create post");
    }
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <h3 className="text-lg font-semibold mb-2">Create a Post</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full border p-2 rounded-md"
          rows="3"
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        
        <input type="file" onChange={handleImageChange} className="mt-2" />
        
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
          disabled={loading}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
};

export default PostForm;
