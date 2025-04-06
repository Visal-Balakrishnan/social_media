import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch all users
export const fetchUsers = createAsyncThunk("admin/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("http://localhost:7000/api/admin/users", { withCredentials: true });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
  }
});

// Delete a user
export const deleteUser = createAsyncThunk("admin/deleteUser", async (userId, { rejectWithValue }) => {
  try {
    await axios.delete(`http://localhost:7000/api/admin/users/${userId}`, { withCredentials: true });
    return userId; // Return the deleted user's ID to update the state
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete user");
  }
});

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload);
      });
  },
});

export default adminUsersSlice.reducer;
