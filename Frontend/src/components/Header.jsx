import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt, FaBars, FaBell, FaComments } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../redux/authSlice";
import { fetchNotifications } from "../redux/notificationSlice";
import { fetchSearchResults, clearSearchResults } from "../redux/searchSlice";
import Notifications from "./Notifications";

const Header = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // State management
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const menuRef = useRef(null);

  const { unreadCount, loading: notifLoading } = useSelector((state) => state.notifications);
  const { users, posts } = useSelector((state) => state.search);

  // Fetch notifications on mount with debugging
  useEffect(() => {
    console.log("Fetching notifications on mount");
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false);
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Logout
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
    setMenuOpen(false);
  };

  // Handle notification toggle
  const handleNotificationClick = () => {
    setNotifOpen((prev) => !prev);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        dispatch(fetchSearchResults(searchQuery));
        setSearchOpen(true);
      } else {
        dispatch(clearSearchResults());
        setSearchOpen(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, dispatch]);

  // Handle search result click
  const handleSearchResultClick = () => {
    setSearchOpen(false);
    setSearchQuery("");
    dispatch(clearSearchResults());
  };

  // Hide menu on specific routes
  const hideMenuRoutes = ["/login", "/register", "/admin/login", "/admin/dashboard", "/admin/reported-posts"];
  const showMenu = !hideMenuRoutes.includes(location.pathname);

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto flex justify-between items-center relative">
        {/* Logo */}
        <Link to="/feed" className="text-2xl font-bold">
          SocialSync
        </Link>

        {/* Search Bar */}
        {showMenu && (
          <div className="relative ml-4 w-full max-w-md" ref={searchRef}>
            <div className="relative flex items-center w-full">
              <input
                type="text"
                placeholder="Search SocialSync..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 text-black bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <svg
                className="absolute left-4 w-5 h-5 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-4.35-4.35M9 16a7 7 0 100-14 7 7 0 000 14z"
                />
              </svg>
            </div>
            {searchOpen && (
              <div className="absolute left-0 mt-1 w-72 bg-white text-black shadow-lg rounded-lg p-3 z-50">
                {users.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold">Users</h3>
                    <ul>
                      {users.map((user) => (
                        <li key={user._id} className="p-2 border-b flex items-center">
                          <img
                            src={user.profilePic?.url || "/default-avatar.png"}
                            alt={user.name}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <Link
                            to={`/profile/${user._id}`}
                            onClick={handleSearchResultClick}
                            className="text-blue-500 hover:underline"
                          >
                            {user.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p>No users found.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Right Section */}
        {showMenu && (
          <div className="relative flex items-center space-x-6">
            <Link to="/chat" className="relative hover:text-gray-200 transition-colors">
              <FaComments className="text-2xl" title="Chat" />
            </Link>
            <button
              onClick={handleNotificationClick}
              className="relative hover:text-gray-200 transition-colors focus:outline-none"
            >
              <FaBell className="text-2xl" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div ref={notifRef} className="absolute top-12 right-0">
                <Notifications />
              </div>
            )}
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center space-x-2 hover:text-gray-200 transition-colors focus:outline-none"
              >
                <FaBars className="text-xl" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-lg overflow-hidden z-50">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 hover:bg-gray-100 transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FaUserCircle className="mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 hover:bg-gray-100 transition-all text-red-600"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;