import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🔍 Search users with debounced API calls
export const searchUsers = createAsyncThunk(
  "chat/searchUsers",
  async (query, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:7000/api/user/search?query=${query}`);
      return response.data.users;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Search failed");
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    users: [],
    searchLoading: false,
    searchError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(searchUsers.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.users = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
      });
  },
});

export default chatSlice.reducer;
