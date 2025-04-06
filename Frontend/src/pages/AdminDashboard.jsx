import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { adminLogout } from "../redux/adminSlice";
import { fetchUsers, deleteUser } from "../redux/adminUsersSlice.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admin } = useSelector((state) => state.admin);
  const { users, loading, error } = useSelector((state) => state.adminUsers);
  const [showUsers, setShowUsers] = useState(false);

  useEffect(() => {
    if (showUsers) {
      dispatch(fetchUsers());
    }
  }, [dispatch, showUsers]);

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate("/admin/login");
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await dispatch(deleteUser(userId));
      toast.success("User deleted successfully");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-lg font-medium">👤 {admin?.name || "Admin"}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-all"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome, {admin?.name || "Admin"} 🎉
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Manage users, content, and settings from here.
        </p>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Users Card */}
          <div className="bg-white p-6 shadow-md rounded-lg text-center">
            <h3 className="text-xl font-semibold">👥 Users</h3>
            <p className="text-gray-600">Manage all users</p>
            <button
              onClick={() => setShowUsers(!showUsers)}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-all"
            >
              {showUsers ? "Hide Users" : "View Users"}
            </button>
          </div>

          {/* Sentiment Report Card */}
          <div className="bg-white p-6 shadow-md rounded-lg text-center">
            <h3 className="text-xl font-semibold">📊 Sentiment Report</h3>
            <p className="text-gray-600">Monitor negative sentiment users</p>
            <button
              onClick={() => navigate("/admin/sentiment-report")}
              className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-all"
            >
              View Report
            </button>
          </div>

          {/* Reported Posts Card */}
          <div className="bg-white p-6 shadow-md rounded-lg text-center">
            <h3 className="text-xl font-semibold">🚨 Reported Posts</h3>
            <p className="text-gray-600">View and manage reported posts</p>
            <button
              onClick={() => navigate("/admin/reported-posts")}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-all"
            >
              View Reported Posts
            </button>
          </div>
        </div>

        {/* Users List */}
        {showUsers && (
          <div className="w-full max-w-4xl bg-white p-6 shadow-md rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">User Management</h3>

            {loading && <p>Loading users...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="p-3 border">Profile</th>
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Email</th>
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(users) && users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-100 transition-all">
                      <td className="p-3 border text-center">
                        <img
                          src={user.profilePic?.url || "/default-profile.png"}
                          alt="Profile"
                          className="w-12 h-12 rounded-full mx-auto shadow"
                        />
                      </td>
                      <td className="p-3 border text-center">{user.name}</td>
                      <td className="p-3 border text-center">{user.email}</td>
                      <td className="p-3 border flex gap-2 justify-center">
                        <button
                          onClick={() => navigate(`/profile/${user._id}`)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-md transition-all hover:bg-blue-600"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-md transition-all hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
