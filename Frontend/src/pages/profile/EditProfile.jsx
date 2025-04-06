import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { updateUserProfile } from "../../redux/authSlice";
import toast from "react-hot-toast";

const EditProfile = ({ onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const dispatch = useDispatch(); 

  const handleSave = async () => {
    try {
      const response = await axios.put(
        "http://localhost:7000/api/user/update-profile",
        { name, bio },
        { withCredentials: true }
      );

      dispatch(updateUserProfile({ name: response.data.name, bio: response.data.bio }));
      toast.success("Profile updated!");
      onClose(); // Close the modal after saving
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
      <input
        type="text"
        placeholder="Name"
        className="w-full p-2 border rounded mb-3"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        placeholder="Bio (max 160 chars)"
        className="w-full p-2 border rounded mb-3"
        maxLength={160}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
      <div className="flex justify-end space-x-2">
        <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded">
          Cancel
        </button>
        <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded">
          Save
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
