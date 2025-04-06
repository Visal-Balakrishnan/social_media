import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch notifications from backend
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:7000/api/notifications", {
        withCredentials: true,
      });
      console.log("Fetched Notifications API Response:", response.data);
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return rejectWithValue(error.response?.data || "Failed to fetch notifications");
    }
  }
);

// Mark a single notification as read
export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      await axios.put(`http://localhost:7000/api/notifications/${notificationId}/read`, {}, { withCredentials: true });
      return notificationId;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return rejectWithValue(error.response?.data || "Failed to mark as read");
    }
  }
);

// Mark all notifications as read (with backend sync)
export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { notifications } = getState().notifications;
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
      if (unreadIds.length > 0) {
        await axios.put(
          "http://localhost:7000/api/notifications/mark-all-read",
          { ids: unreadIds },
          { withCredentials: true }
        );
      }
      return unreadIds;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return rejectWithValue(error.response?.data || "Failed to mark all as read");
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      if (!state.notifications.some(n => n._id === action.payload._id)) {
        state.notifications.unshift(action.payload);
        if (!action.payload.isRead) state.unreadCount += 1;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        console.log("fetchNotifications.fulfilled Payload:", action.payload);
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.notifications = state.notifications.map(n =>
          n._id === action.payload ? { ...n, isRead: true } : n
        );
        state.unreadCount = state.notifications.filter(n => !n.isRead).length;
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;