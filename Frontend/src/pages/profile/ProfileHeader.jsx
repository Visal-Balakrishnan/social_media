import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, uploadCoverPhoto } from "../../redux/authSlice";
import { FaPencilAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const ProfileHeader = ({ setShowDetails }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {user, status} = useSelector((state) => state.auth);
  const [isUploading, setIsUploading] = useState(false);
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const handleCoverPhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await dispatch(uploadCoverPhoto(file)).unwrap(); // Wait for the thunk to complete
      toast.success("Cover photo updated successfully!");
    } catch (error) {
      toast.error("Failed to update cover photo.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="relative bg-cover bg-center h-64 rounded-xl overflow-hidden"
      style={{
        backgroundImage: `url(${user?.coverPic?.url || "https://via.placeholder.com/1200x400"})`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black p-4 h-full flex justify-between items-end">
        {/* Left: Profile Picture, Name & Bio */}
        <div className="flex items-center space-x-4">
          <img
            src={user?.profilePic?.url || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-white"
          />

          <div className="text-white">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              {user?.name || "User"}
              <FaPencilAlt
                className="text-gray-300 cursor-pointer"
                onClick={() => setShowDetails(true)}
              />
            </h2>
            <p className="text-sm text-gray-300">
              {user?.bio || "No bio set"}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-5 py-2 rounded-full"
        >
          Logout
        </button>

        {/* Change Cover Photo */}
        <label
          htmlFor="coverPhoto"
          className="absolute bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-full cursor-pointer"
        >
          {isUploading ? "Uploading..." : "Change Cover"}
        </label>
        <input
          type="file"
          id="coverPhoto"
          className="hidden"
          accept="image/*"
          onChange={handleCoverPhotoChange}
        />
      </div>
    </div>
  );
};

export default ProfileHeader;
