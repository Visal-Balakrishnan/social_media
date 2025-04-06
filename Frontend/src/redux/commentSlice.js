import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch comments for a specific post
export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:7000/api/comments/${postId}`);
      return { postId, comments: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch comments");
    }
  }
);

// Add a new comment
export const addComment = createAsyncThunk(
  "comments/addComment",
  async ({ postId, text }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const loggedInUser = state.auth.user; // Get current user from Redux

      const response = await axios.post(
        `http://localhost:7000/api/comments/${postId}`,
        { text },
        { withCredentials: true }
      );

      // Manually attach user details to avoid "Unknown User" issue
      return {
        ...response.data,
        user: {
          _id: loggedInUser._id,
          name: loggedInUser.name,
          profilePic: loggedInUser.profilePic,
        },
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to add comment");
    }
  }
);

// Delete a comment
export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async (commentId, { rejectWithValue }) => {
    try {
      await axios.delete(`http://localhost:7000/api/comments/${commentId}`, { withCredentials: true });
      return commentId; // Return the deleted comment's ID
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete comment");
    }
  }
);

const commentSlice = createSlice({
  name: "comments",
  initialState: {
    commentsByPost: {}, // Store comments per post
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Comments
      .addCase(fetchComments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.commentsByPost[action.payload.postId] = action.payload.comments;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Add Comment (with User Data Fix)
      .addCase(addComment.fulfilled, (state, action) => {
        const postId = action.payload.post;
        if (!state.commentsByPost[postId]) {
          state.commentsByPost[postId] = [];
        }
        state.commentsByPost[postId].push(action.payload);
      })

      // Delete Comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        for (const postId in state.commentsByPost) {
          state.commentsByPost[postId] = state.commentsByPost[postId].filter(
            (comment) => comment._id !== action.payload
          );
        }
      });
  },
});

export default commentSlice.reducer;
