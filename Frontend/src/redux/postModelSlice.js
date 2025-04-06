import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to open a post model (fetching post details if needed)
export const fetchPostFormodel = createAsyncThunk(
  "postmodel/fetchPostFormodel",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:7000/api/post/${postId}`, { credentials: "include" });
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue("Failed to fetch post details");
    }
  }
);

const postModelSlice = createSlice({
  name: "postmodel",
  initialState: {
    isOpen: false,
    post: null,
    loading: false,
    error: null,
  },
  reducers: {
    openPostModel: (state, action) => {
      state.isOpen = true;
      state.post = action.payload; // Directly set post data if available
    },
    closePostModel: (state) => {
      state.isOpen = false;
      state.post = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostFormodel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostFormodel.fulfilled, (state, action) => {
        state.loading = false;
        state.post = action.payload;
        state.isOpen = true; // Open model once post is loaded
      })
      .addCase(fetchPostFormodel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { openPostModel, closePostModel } = postModelSlice.actions;
export default postModelSlice.reducer;
