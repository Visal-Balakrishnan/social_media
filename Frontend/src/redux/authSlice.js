import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Load initial state from localStorage
const userFromStorage = JSON.parse(localStorage.getItem("user")) || null;
const tokenFromStorage = localStorage.getItem("token") || null;

// Initial State
const initialState = {
  user: userFromStorage,
  isAuthenticated: !!userFromStorage,
  token: tokenFromStorage,
  status: "idle",
  error: null,
};

// 🔹 Login User (Async Thunk)
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:7000/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      return response.data; // { user, token }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// 🔹 Logout User (Async Thunk)
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
    await axios.get("http://localhost:7000/api/auth/logout", {}, { withCredentials: true });
    return true;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Logout failed");
  }
});

// 🔹 Upload Cover Photo (Async Thunk)
export const uploadCoverPhoto = createAsyncThunk(
  "auth/uploadCoverPhoto",
  async (coverFile, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", coverFile);

      const response = await axios.put(
        "http://localhost:7000/api/user/cover-photo",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data.coverPic;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Cover photo upload failed");
    }
  }
);

// 🔹 Auth Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 🟢 Login User
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      })

      // 🔴 Logout User
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        state.status = "idle";
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // 🖼️ Upload Cover Photo
      .addCase(uploadCoverPhoto.pending, (state) => {
        state.status = "loading";
      })
      .addCase(uploadCoverPhoto.fulfilled, (state, action) => {
        if (state.user) {
          state.user.coverPic = action.payload;
          localStorage.setItem("user", JSON.stringify(state.user));
        }
        state.status = "succeeded";
      })
      .addCase(uploadCoverPhoto.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { updateUserProfile } = authSlice.actions;
export default authSlice.reducer;