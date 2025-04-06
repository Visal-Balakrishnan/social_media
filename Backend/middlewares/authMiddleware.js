import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { Admin } from "../models/adminModel.js"; // Import Admin model

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    //console.log("Received Token:", token);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SEC);
    //console.log("Decoded Token:", decoded);

    // Fetch user or admin from database
    let user = await User.findById(decoded.id);
    if (!user) {
      user = await Admin.findById(decoded.id); // Check if it's an admin
      if (!user) return res.status(404).json({ message: "User not found" });
      req.isAdmin = true; // Flag for admin users
    } else {
      req.isAdmin = false;
    }

    req.user = user; // Attach user/admin to request object
    //console.log("Authenticated User:", req.user);

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

export default authMiddleware;
