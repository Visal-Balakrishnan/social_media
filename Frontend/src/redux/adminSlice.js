import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"; // Use axios instance with credentials

// Get stored admin from localStorage
const adminFromStorage = JSON.parse(localStorage.getItem("admin")) || null;

// Admin login action
export const adminLogin = createAsyncThunk("admin/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post("http://localhost:7000/api/admin/login", credentials, { withCredentials: true });

    // Store admin data in localStorage
    localStorage.setItem("admin", JSON.stringify(response.data.admin));

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Admin login failed");
  }
});

// Admin logout action
export const adminLogout = createAsyncThunk("admin/logout", async (_, { rejectWithValue }) => {
  try {
    await axios.post("http://localhost:7000/api/admin/logout", {}, { withCredentials: true });

    // Remove admin data from localStorage
    localStorage.removeItem("admin");

    return null;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Logout failed");
  }
});

// Fetch users with >60% negative sentiment
export const fetchNegativeSentimentUsers = createAsyncThunk(
  "admin/fetchNegativeSentimentUsers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("http://localhost:7000/api/admin/sentiment-report", { withCredentials: true });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch sentiment report");
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    admin: adminFromStorage,
    loading: false,
    error: null,
    negativeUsers: [], // New state for sentiment report
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload.admin;
        state.error = null;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.admin = null;
      })
      .addCase(fetchNegativeSentimentUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNegativeSentimentUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.negativeUsers = action.payload;
      })
      .addCase(fetchNegativeSentimentUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminSlice.reducer;
