import ProfileHeader from "../pages/profile/ProfileHeader";
import ProfileDetails from "../pages/profile/ProfileDetails";
import ProfilePosts from "../pages/profile/ProfilePosts";

import React from "react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-6">
        {/* Profile Header (Cover Photo + Profile Pic) */}
        <ProfileHeader />

        {/* Profile Details (User Info + Edit Profile) */}
        <ProfileDetails />

        {/* Profile Posts (User's Posts) */}
        <ProfilePosts />
      </div>
    </div>
  );
};

export default Profile;
