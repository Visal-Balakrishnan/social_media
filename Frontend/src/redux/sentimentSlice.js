import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fetch sentiment report
export const fetchSentimentReport = createAsyncThunk(
  "sentiment/fetchSentimentReport",
  async (userId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const { data } = await axios.get(`http://localhost:7000/api/sentiment/${userId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error fetching sentiment report");
    }
  }
);

const sentimentSlice = createSlice({
  name: "sentiment",
  initialState: {
    report: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSentimentReport: (state) => {
      state.report = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSentimentReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSentimentReport.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(fetchSentimentReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSentimentReport } = sentimentSlice.actions;
export default sentimentSlice.reducer;
