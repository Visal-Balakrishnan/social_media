import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { followUser, unfollowUser } from "../../redux/followSlice";
import { updateUserProfile } from "../../redux/authSlice";

const FollowersList = ({ followers = [] }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: loggedInUser, status: authStatus } = useSelector((state) => state.auth);
  const { status: followStatus } = useSelector((state) => state.follow);

  const handleFollowToggle = (targetUser) => {
    if (!loggedInUser) {
      toast.error("Please log in to follow users");
      return;
    }

    if (loggedInUser._id === targetUser._id) {
      toast.error("You cannot follow yourself");
      return;
    }

    const isFollowing = loggedInUser?.following?.some(
      (followingUser) => followingUser._id === targetUser._id
    );

    if (isFollowing) {
      // Unfollow the user
      dispatch(unfollowUser(targetUser._id))
        .unwrap()
        .then((updatedUser) => {
          dispatch(updateUserProfile(updatedUser));
          toast.success(`Unfollowed ${targetUser.name}`);
        })
        .catch((error) => {
          toast.error(error);
        });
    } else {
      // Follow the user
      dispatch(followUser(targetUser._id))
        .unwrap()
        .then((updatedUser) => {
          dispatch(updateUserProfile(updatedUser));
          toast.success(`Followed ${targetUser.name}`);
        })
        .catch((error) => {
          toast.error(error);
        });
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 border-b pb-2">Followers</h3>

      {followers.length === 0 ? (
        <p className="text-gray-500 text-center">No followers yet.</p>
      ) : (
        <ul className="space-y-3">
          {followers.map((follower, index) => {
            const isFollowing = loggedInUser?.following?.some(
              (followingUser) => followingUser._id === follower._id
            );

            return (
              <li
                key={follower?._id || index}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition duration-200"
              >
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => follower?._id && navigate(`/profile/${follower._id}`)}
                >
                  <img
                    src={follower?.profilePic?.url || "/default-avatar.png"}
                    alt={follower?.name || "User"}
                    className="w-12 h-12 rounded-full border mr-3"
                  />
                  <p className="text-lg font-medium">{follower?.name || "Unknown User"}</p>
                </div>
                {loggedInUser && loggedInUser._id !== follower._id && (
                  <button
                    onClick={() => handleFollowToggle(follower)}
                    disabled={followStatus === "loading" || authStatus === "loading"}
                    className={`px-3 py-1 rounded-md text-white font-semibold text-sm ${
                      isFollowing ? "bg-gray-500" : "bg-blue-500"
                    } ${
                      (followStatus === "loading" || authStatus === "loading") &&
                      "opacity-50 cursor-not-allowed"
                    } hover:opacity-90`}
                  >
                    {followStatus === "loading" &&
                    follower._id === loggedInUser?.following?.slice(-1)[0]?._id ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin h-4 w-4 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          ></path>
                        </svg>
                        {isFollowing ? "Unfollowing..." : "Following..."}
                      </span>
                    ) : isFollowing ? (
                      "Unfollow"
                    ) : (
                      "Follow"
                    )}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FollowersList;