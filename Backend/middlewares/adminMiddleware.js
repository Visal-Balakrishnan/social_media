import jwt from "jsonwebtoken";
import { Admin } from "../models/adminModel.js";

const adminMiddleware = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.adminToken;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SEC);

    // Check if the user is an admin
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.admin = admin; // Attach admin data to request object
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

export default adminMiddleware;
