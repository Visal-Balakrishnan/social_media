import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { followUser, unfollowUser, resetFollowStatus } from "../redux/followSlice";
import { updateUserProfile } from "../redux/authSlice";
import Post from "./Post"; // Import the Post component

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: loggedInUser } = useSelector((state) => state.auth);
  const { status: followStatus, error: followError } = useSelector((state) => state.follow);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts"); // Default tab

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:7000/api/user/${userId}`, {
          withCredentials: true,
        });
        setProfile(res.data.user);
        setPosts(res.data.posts || []); // Ensure posts is an array
        setFollowers(res.data.user.followers || []);
        setFollowing(res.data.user.following || []);
      } catch (error) {
        console.error("Error fetching user profile:", error.response?.data?.message);
        toast.error(error.response?.data?.message || "Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();

    // Reset follow status on unmount
    return () => {
      dispatch(resetFollowStatus());
    };
  }, [userId, dispatch]);

  const handleFollowToggle = () => {
    if (!loggedInUser) {
      toast.error("Please log in to follow users");
      return;
    }

    if (loggedInUser._id === userId) {
      toast.error("You cannot follow yourself");
      return;
    }

    const isFollowing = loggedInUser?.following?.some(
      (followingUser) => followingUser._id === userId
    );

    if (isFollowing) {
      // Unfollow the user
      dispatch(unfollowUser(userId))
        .unwrap()
        .then((updatedUser) => {
          dispatch(updateUserProfile(updatedUser));
          setFollowers((prev) => prev.filter((f) => f._id !== loggedInUser._id));
          toast.success(`Unfollowed ${profile.name}`);
        })
        .catch((error) => {
          toast.error(error);
        });
    } else {
      // Follow the user
      dispatch(followUser(userId))
        .unwrap()
        .then((updatedUser) => {
          dispatch(updateUserProfile(updatedUser));
          setFollowers((prev) => [...prev, loggedInUser]);
          toast.success(`Followed ${profile.name}`);
        })
        .catch((error) => {
          toast.error(error);
        });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg
          className="animate-spin h-8 w-8 text-blue-500"
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
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center mt-10">User not found</div>;
  }

  const isFollowing = loggedInUser?.following?.some(
    (followingUser) => followingUser._id === userId
  );

  return (
    <div className="max-w-3xl mx-auto mt-6 bg-white shadow-md rounded-lg overflow-hidden">
      {/* ✅ Profile Cover */}
      <div className="relative">
        <img
          src={profile.coverPic?.url || "/default-cover.jpg"}
          alt="Cover"
          className="w-full h-40 object-cover"
        />
        <div className="absolute bottom-[-30px] left-4 flex items-center">
          <img
            src={profile.profilePic?.url || "/default-avatar.png"}
            alt="Profile"
            className="w-20 h-20 rounded-full border-4 border-white shadow-md"
          />
          <div className="ml-3">
            <h2 className="text-2xl font-semibold">{profile.name}</h2>
            {profile.bio && <p className="text-gray-600">{profile.bio}</p>}
            <p className="text-gray-500 text-sm">
              {followers.length} Followers • {following.length} Following
            </p>
          </div>
        </div>
      </div>

      {/* ✅ Follow Button */}
      <div className="p-4 text-right">
        {loggedInUser && loggedInUser._id !== userId && (
          <button
            onClick={handleFollowToggle}
            disabled={followStatus === "loading"}
            className={`px-4 py-2 rounded-md text-white font-semibold ${
              isFollowing ? "bg-gray-300 text-black" : "bg-blue-600 text-white"
            } ${followStatus === "loading" ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
          >
            {followStatus === "loading" ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
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
      </div>

      {/* ✅ Tabs Navigation */}
      <div className="border-b flex justify-around">
        {["posts", "followers", "following"].map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-3 font-semibold text-center ${
              activeTab === tab ? "border-b-4 border-blue-600 text-blue-600" : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ✅ Tab Content */}
      <div className="p-4">
        {activeTab === "posts" && (
          <>
            <h3 className="text-lg font-semibold">Posts</h3>
            {posts.length === 0 ? (
              <p className="text-gray-500">No posts yet.</p>
            ) : (
              posts.map((post) => <Post key={post._id} post={post} />)
            )}
          </>
        )}

        {activeTab === "followers" && (
          <>
            <h3 className="text-lg font-semibold">Followers</h3>
            <div className="grid grid-cols-3 gap-4">
              {followers.length === 0 ? (
                <p className="text-gray-500">No followers yet.</p>
              ) : (
                followers.map((follower) => (
                  <div
                    key={follower._id}
                    className="cursor-pointer text-center"
                    onClick={() => navigate(`/profile/${follower._id}`)}
                  >
                    <img
                      src={follower.profilePic?.url || "/default-avatar.png"}
                      alt={follower.name}
                      className="w-16 h-16 rounded-full mx-auto"
                    />
                    <p className="text-sm">{follower.name}</p>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === "following" && (
          <>
            <h3 className="text-lg font-semibold">Following</h3>
            <div className="grid grid-cols-3 gap-4">
              {following.length === 0 ? (
                <p className="text-gray-500">Not following anyone.</p>
              ) : (
                following.map((user) => (
                  <div
                    key={user._id}
                    className="cursor-pointer text-center"
                    onClick={() => navigate(`/profile/${user._id}`)}
                  >
                    <img
                      src={user.profilePic?.url || "/default-avatar.png"}
                      alt={user.name}
                      className="w-16 h-16 rounded-full mx-auto"
                    />
                    <p className="text-sm">{user.name}</p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;