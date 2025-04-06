import express from "express";
import { createNotification, getNotifications, markAsRead,markAllNotificationsAsRead } from "../controllers/notificationController.js";
import  authMiddleware  from "../middlewares/authMiddleware.js"; // Ensure authentication

const router = express.Router();

router.post("/", authMiddleware, createNotification); // Create a notification
router.get("/", authMiddleware, getNotifications); // Get user notifications
router.put("/:id/read", authMiddleware, markAsRead); // Mark a notification as read
router.put("/mark-all-read", authMiddleware, markAllNotificationsAsRead);

export default router;
