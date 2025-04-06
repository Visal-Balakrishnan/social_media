import Notification from "../models/notificationModel.js";

// Create a new notification
export const createNotification = async (req, res) => {
  try {
    const { type, sender, receiver, post, message } = req.body;

    if (!type || !sender || !receiver || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const notification = new Notification({ type, sender, receiver, post, message });
    await notification.save();

    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all notifications for the logged-in user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user?.id; // Ensure req.user exists
    if (!userId) {
      console.error("No user ID found in request");
      return res.status(401).json({ error: "User not authenticated" });
    }

    console.log("Fetching notifications for user ID:", userId);

    const notifications = await Notification.find({ receiver: userId })
      .populate("sender", "name profilePic")
      .populate("post", "text image")
      .sort({ createdAt: -1 });

    console.log("Notifications found:", notifications.length);

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark a single notification as read
export const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, receiver: userId }, // Ensure only user's notification is updated
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found or not authorized" });
    }

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark all notifications as read for the logged-in user
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    console.log("Marking all notifications as read for user ID:", userId);

    const result = await Notification.updateMany(
      { receiver: userId, isRead: false },
      { $set: { isRead: true } }
    );

    console.log("Notifications marked as read:", result.modifiedCount);

    if (result.modifiedCount === 0) {
      return res.status(200).json({ message: "No unread notifications to mark" });
    }

    res.status(200).json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};