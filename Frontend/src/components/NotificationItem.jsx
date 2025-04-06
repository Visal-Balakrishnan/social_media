import { useDispatch } from "react-redux";
import { markAsRead } from "../redux/notificationSlice";
import { Link } from "react-router-dom";

const NotificationItem = ({ notification }) => {
  const dispatch = useDispatch();

  const handleMarkAsRead = () => {
    dispatch(markAsRead(notification._id));
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 border-b ${
        notification.isRead ? "bg-gray-100" : "bg-white"
      } text-black`}
    >
      <img
        src={notification.sender?.profilePic.url || "/default-avatar.png"}
        alt="User"
        className="w-10 h-10 rounded-full"
      />
      <div className="flex-1">
        <p className="text-sm text-black">
          <strong>{notification.sender?.name}</strong>{" "}
          {notification.type === "like"
            ? "liked your post"
            : "commented on your post"}
        </p>
        {/* {notification.post && (
          <Link
            to={`/post/${notification.post._id}`}
            className="text-blue-500 hover:underline text-sm"
            onClick={handleMarkAsRead}
          >
            View Post
          </Link>
        )} */}
        <p className="text-xs text-gray-500">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
      {!notification.isRead && (
        <button
          onClick={handleMarkAsRead}
          className="text-xs text-blue-500 hover:underline"
        >
          Mark as Read
        </button>
      )}
    </div>
  );
};

export default NotificationItem;