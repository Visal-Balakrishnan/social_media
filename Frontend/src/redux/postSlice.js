import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_URL = "http://localhost:7000/api/post";

// ✅ Async thunk for creating a post
export const createPost = createAsyncThunk(
  "posts/createPost",
  async ({ text, image }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("User not authenticated");

      const formData = new FormData();
      formData.append("text", text);
      if (image) formData.append("image", image);

      const response = await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      toast.success("Post created successfully!");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create post");
    }
  }
);

// ✅ Fetch all posts (Feed)
export const fetchAllPosts = createAsyncThunk(
  "posts/fetchAllPosts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, { withCredentials: true });
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch posts");
    }
  }
);

// ✅ Fetch user's own posts (Profile)
export const fetchUserPosts = createAsyncThunk(
  "posts/fetchUserPosts",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("User not authenticated");

      const response = await axios.get(`${API_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user posts");
    }
  }
);

// ✅ Fetch a single post by ID
export const fetchPostById = createAsyncThunk(
  "posts/fetchPostById",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${postId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch post");
    }
  }
);

// ✅ Delete a post
export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("User not authenticated");

      await axios.delete(`${API_URL}/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      toast.success("Post deleted successfully!");
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete post");
    }
  }
);

// ✅ Like a post
export const likePost = createAsyncThunk(
  "posts/likePost",
  async (postId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("User not authenticated");

      const response = await axios.put(`${API_URL}/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      return { postId, likes: response.data.likes };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to like post");
    }
  }
);

// ✅ Report a post
export const reportPost = createAsyncThunk(
  "posts/reportPost",
  async ({ postId, reason }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("User not authenticated");

      const response = await axios.post(
        `${API_URL}/${postId}/report`,
        { reason },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (response.data.message === "You have already reported the post") {
        return rejectWithValue("Already reported");
      }

      toast.success("Post reported successfully!");
      return { postId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to report post");
    }
  }
);

// ✅ Redux slice
const postSlice = createSlice({
  name: "posts",
  initialState: {
    posts: [], // User's posts (Profile Page)
    feed: [], // All posts (Feed Page)
    postDetails: null, // Single post details
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ✅ Handle post creation
      .addCase(createPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
        state.feed.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      // ✅ Fetch all posts (Feed)
      .addCase(fetchAllPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.feed = action.payload;
      })
      .addCase(fetchAllPosts.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      // ✅ Fetch user-specific posts (Profile)
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      // ✅ Fetch single post by ID
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.postDetails = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      // ✅ Handle post deletion
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((post) => post._id !== action.payload);
        state.feed = state.feed.filter((post) => post._id !== action.payload);
      })
      .addCase(deletePost.rejected, (state, action) => {
        toast.error(action.payload);
      })

      // ✅ Handle like functionality
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, likes } = action.payload;
        state.feed = state.feed.map((post) => (post._id === postId ? { ...post, likes } : post));
        state.posts = state.posts.map((post) => (post._id === postId ? { ...post, likes } : post));
      })

      // ✅ Handle report functionality
      .addCase(reportPost.rejected, (state, action) => {
        toast.error(action.payload);
      });
  },
});

export default postSlice.reducer;
