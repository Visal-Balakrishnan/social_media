import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { markAllAsRead } from "../redux/notificationSlice";
import NotificationItem from "./NotificationItem";

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, loading, unreadCount, error } = useSelector(
    (state) => state.notifications
  );

  console.log("Notifications State:", { notifications, loading, unreadCount, error });

  return (
    <div className="w-80 bg-white shadow-md rounded-md overflow-hidden text-black">
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="text-lg font-semibold text-black">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={() => dispatch(markAllAsRead())}
            className="text-sm text-blue-500 hover:underline disabled:opacity-50"
            disabled={loading}
          >
            Mark All as Read
          </button>
        )}
      </div>
      {loading ? (
        <p className="p-4 text-center text-black">Loading...</p>
      ) : error ? (
        <p className="p-4 text-center text-red-500">Error: {error}</p>
      ) : notifications.length > 0 ? (
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((notification) => (
            <NotificationItem key={notification._id} notification={notification} />
          ))}
        </div>
      ) : (
        <p className="p-4 text-center text-black">No new notifications</p>
      )}
    </div>
  );
};

export default Notifications;