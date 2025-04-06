import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Initial State
const initialState = {
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
};

// 🔹 Follow User (Async Thunk)
export const followUser = createAsyncThunk(
  "follow/followUser",
  async (targetUserId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `http://localhost:7000/api/user/follow/${targetUserId}`,
        {},
        { withCredentials: true }
      );
      return response.data.user; // Updated user data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to follow user");
    }
  }
);

// 🔹 Unfollow User (Async Thunk)
export const unfollowUser = createAsyncThunk(
  "follow/unfollowUser",
  async (targetUserId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `http://localhost:7000/api/user/unfollow/${targetUserId}`,
        {},
        { withCredentials: true }
      );
      return response.data.user; // Updated user data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to unfollow user");
    }
  }
);

// 🔹 Follow Slice
const followSlice = createSlice({
  name: "follow",
  initialState,
  reducers: {
    resetFollowStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🟢 Follow User
      .addCase(followUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(followUser.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(followUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // 🔴 Unfollow User
      .addCase(unfollowUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(unfollowUser.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetFollowStatus } = followSlice.actions;
export default followSlice.reducer;