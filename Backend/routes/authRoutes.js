import express from "express"
import { loginUser, logoutUser, registerUser,updateCoverPhoto } from "../controllers/authController.js";
import uploadFile from "../middlewares/multer.js";
import  authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router()
router.post("/register",uploadFile , registerUser)
router.post("/login",loginUser)
router.get("/logout",logoutUser)
router.put("/update-cover",authMiddleware, uploadFile, updateCoverPhoto);
export default router;