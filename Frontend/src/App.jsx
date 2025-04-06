import React, { useEffect } from "react";
import "./index.css"; // Ensure Tailwind is imported
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux"; // Import Provider & useSelector
import store from "./redux/store"; // Import Redux store
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/profile/Profile";
import { Toaster } from "react-hot-toast";
import { logoutUser } from "./redux/authSlice";
import Feed from "./components/Feed";
import PublicProfile from "./components/PublicProfile";
import Layout from "./components/Layout";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Chat from "./components/Chat"; // Import Chat Page
import socket from "./socket.js"; // Import socket instance
import ReportedPosts from "./components/ReportedPosts.jsx";
import PostDetails from "./components/PostDetails.jsx";
import PostModelView from "./components/PostModelView"; // ✅ Import PostModalView
import SentimentReport   from "./components/SentimentReport.jsx";

const AppContent = () => {
  const dispatch = useDispatch();
  const { isOpen, post } = useSelector((state) => state.postModel); // ✅ Get modal state

  useEffect(() => {
    console.log("Attempting to connect to Socket.io...");

    socket.on("connect", () => {
      console.log("Connected to Socket.io with ID:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    const handleStorageChange = (event) => {
      if (event.key === "logoutEvent") {
        dispatch(logoutUser()); // Dispatch logout action in all tabs
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      socket.disconnect(); // Cleanup socket connection
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch]);

  return (
    <>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/profile/:userId" element={<PublicProfile />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/reported-posts" element={<ReportedPosts />} />
            <Route path="/posts/:postId" element={<PostDetails />} />
            <Route path="/admin/sentiment-report" element={<SentimentReport />} />
          </Routes>
        </Layout>
      </BrowserRouter>

      {/* ✅ Global Post Modal */}
      {isOpen && <PostModelView postId={post?._id} />}

      <Toaster position="top-center" reverseOrder={false} /> {/* Add Toaster */}
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;