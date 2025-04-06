import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:7000/api/admin/reported-posts"; // Update with your backend URL

// Fetch reported posts
export const fetchReportedPosts = createAsyncThunk("reportedPosts/fetch", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(API_URL, { withCredentials: true });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Error fetching reported posts");
  }
});

// Delete reported post
export const deleteReportedPost = createAsyncThunk("reportedPosts/delete", async (postId, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/${postId}`, { withCredentials: true });
    return postId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Error deleting post");
  }
});

// Mark post as safe (removes reports)
export const markPostAsSafe = createAsyncThunk("reportedPosts/markSafe", async (postId, { rejectWithValue }) => {
  try {
    await axios.put(`${API_URL}/${postId}/mark-safe`, {}, { withCredentials: true });
    return postId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Error marking post as safe");
  }
});

const reportedPostsSlice = createSlice({
  name: "reportedPosts",
  initialState: {
    reportedPosts: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch reported posts
      .addCase(fetchReportedPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportedPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.reportedPosts = action.payload;
      })
      .addCase(fetchReportedPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete reported post
      .addCase(deleteReportedPost.fulfilled, (state, action) => {
        state.reportedPosts = state.reportedPosts.filter((post) => post._id !== action.payload);
      })
      .addCase(deleteReportedPost.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Mark post as safe
      .addCase(markPostAsSafe.fulfilled, (state, action) => {
        state.reportedPosts = state.reportedPosts.filter((post) => post._id !== action.payload);
      })
      .addCase(markPostAsSafe.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default reportedPostsSlice.reducer;
