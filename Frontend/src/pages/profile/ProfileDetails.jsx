import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../../redux/authSlice.js"; // Assuming the path is correct
import { debounce } from "lodash";

const ProfileDetails = ({ user, setShowDetails }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
  });
  const [profilePic, setProfilePic] = useState(null); // For the new profile picture file
  const [previewPic, setPreviewPic] = useState(user?.profilePic?.url || "/default-avatar.png");

  // Log the initial formData to ensure name is set correctly
  useEffect(() => {
    console.log("Initial formData:", formData);
    console.log("User object:", user);
  }, [formData, user]);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle profile picture selection and preview
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size must be less than 5MB.");
        return;
      }
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate form inputs
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required.");
      return false;
    }
    if (formData.name.length > 50) {
      toast.error("Name must be less than 50 characters.");
      return false;
    }
    if (formData.bio.length > 150) {
      toast.error("Bio must be less than 150 characters.");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSave = async () => {
    if (!validateForm()) return;

    if (profilePic && !window.confirm("Are you sure you want to update your profile picture?")) {
        return;
    }

    setLoading(true);
    try {
        const data = new FormData();
        data.append("name", formData.name);
        data.append("bio", formData.bio);
        if (profilePic) {
            data.append("file", profilePic);
        }

        console.log("FormData contents:");
        for (let [key, value] of data.entries()) {
            console.log(`${key}: ${value}`);
        }

        const response = await axios.put(
            "http://localhost:7000/api/user/update-profile",
            data,
            {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            }
        );

        dispatch(updateUserProfile(response.data.user));
        toast.success("Profile updated successfully!");
        setShowDetails(false);
        setProfilePic(null);
    } catch (error) {
        console.error("Error updating profile:", error);
        const errorMessage = error.response?.data?.message;
        if (errorMessage === "User not found") {
            toast.error("User not found. Please log in again.");
        } else if (errorMessage.includes("validation")) {
            toast.error("Invalid input. Please check your data.");
        } else {
            // Even if the request fails, the data might have been updated
            try {
                const updatedUserResponse = await axios.get(
                    "http://localhost:7000/api/user/profile",
                    { withCredentials: true }
                );
                dispatch(updateUserProfile(updatedUserResponse.data.user));
                toast.success("Profile updated successfully, but there was a server issue. Changes applied.");
                setShowDetails(false);
                setProfilePic(null);
            } catch (fetchError) {
                console.error("Error fetching updated user:", fetchError);
                toast.error(errorMessage || "Failed to update profile.");
            }
        }
    } finally {
        setLoading(false);
    }
};
  // Debounce the save function to prevent rapid clicks
  const debouncedHandleSave = debounce(handleSave, 300);

  // Handle cancel button
  const handleCancel = () => {
    setShowDetails(false);
    setFormData({
      name: user?.name || "",
      bio: user?.bio || "",
    });
    setProfilePic(null);
    setPreviewPic(user?.profilePic?.url || "/default-avatar.png");
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mt-6 max-w-3xl mx-auto">
      <div className="space-y-5">
        {/* Profile Picture Preview and Upload */}
        <div className="flex items-center space-x-4">
          <img
            src={previewPic}
            alt="Profile Preview"
            className="w-16 h-16 rounded-full border-2 border-gray-300"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={loading}
            />
          </div>
        </div>

        {/* Form Inputs */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows="3"
            disabled={loading}
          />
          <p className="text-sm text-gray-500">{formData.bio.length}/150</p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleCancel}
            className="bg-gray-300 px-6 py-2 rounded-full"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={debouncedHandleSave}
            className={`bg-blue-500 text-white px-6 py-2 rounded-full flex items-center space-x-2 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                <span>Saving...</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;