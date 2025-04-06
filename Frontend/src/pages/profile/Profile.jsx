import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ProfileHeader from "./ProfileHeader";
import ProfileDetails from "./ProfileDetails";
import ProfilePosts from "./ProfilePosts";
import FollowingList from "./FollowingList";
import FollowersList from "./FollowersList";
import SentimentReport from "./SentimentReport";
import { resetFollowStatus } from "../../redux/followSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(false); // We can set this to false since we're not fetching

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(resetFollowStatus());
    };
  }, [dispatch]);

  if (!user) {
    return (
      <div className="text-center text-gray-600 mt-10 text-lg">
        <svg
          className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4"
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
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto py-6">
        <ProfileHeader user={user} setShowDetails={setShowDetails} />
        {showDetails && (
          <div className="px-4 mt-6">
            <ProfileDetails user={user} setShowDetails={setShowDetails} />
          </div>
        )}
        <div className="flex space-x-6 border-b mb-4 px-4 mt-6">
          <button
            className={`pb-2 px-4 ${
              activeTab === "posts" ? "border-b-2 border-blue-500 font-bold" : ""
            }`}
            onClick={() => setActiveTab("posts")}
          >
            Posts
          </button>
          <button
            className={`pb-2 px-4 ${
              activeTab === "following" ? "border-b-2 border-blue-500 font-bold" : ""
            }`}
            onClick={() => setActiveTab("following")}
          >
            Following
          </button>
          <button
            className={`pb-2 px-4 ${
              activeTab === "followers" ? "border-b-2 border-blue-500 font-bold" : ""
            }`}
            onClick={() => setActiveTab("followers")}
          >
            Followers
          </button>
          <button
            className={`pb-2 px-4 ${
              activeTab === "sentiment" ? "border-b-2 border-blue-500 font-bold" : ""
            }`}
            onClick={() => setActiveTab("sentiment")}
          >
            Sentiment Report
          </button>
        </div>
        <div className="px-4 mt-6">
          {loading ? (
            <div className="text-center text-gray-600">Loading profile data...</div>
          ) : (
            <>
              {activeTab === "posts" && <ProfilePosts user={user} />}
              {activeTab === "following" && <FollowingList following={user.following} />}
              {activeTab === "followers" && <FollowersList followers={user.followers} />}
              {activeTab === "sentiment" && <SentimentReport userId={user._id} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;