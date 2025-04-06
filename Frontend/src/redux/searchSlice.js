import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async Thunk to fetch search results
export const fetchSearchResults = createAsyncThunk(
  "search/fetchResults",
  async (query, { rejectWithValue }) => {
    try {
        const res = await axios.get(`http://localhost:7000/api/search?q=${query}`, {
            withCredentials: true, // Ensure cookies are sent if needed
          });
          console.log("Search Results:", res.data); // Debugging
      return res.data; // Contains users and posts
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState: {
    users: [],
    posts: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearSearchResults: (state) => {
      state.users = [];
      state.posts = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || []; // ✅ Ensure users is always an array
        state.posts = action.payload.posts || []; // ✅ Fix missing posts update
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { clearSearchResults } = searchSlice.actions;
export default searchSlice.reducer;
