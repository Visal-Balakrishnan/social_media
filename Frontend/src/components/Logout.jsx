// src/components/Logout.jsx

import React from "react";
import { useDispatch } from "react-redux"; // For dispatching actions
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice"; // Import the logout action from the Redux slice

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action to update Redux state
    navigate("/login"); // Redirect to the login page after logout
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
    >
      Logout
    </button>
  );
};

export default Logout;
