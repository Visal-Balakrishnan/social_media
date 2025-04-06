import express from "express"
import uploadFile from "../middlewares/multer.js";
//import { protect } from "../middlewares/authMiddleware.js";
import { updateCoverPhoto,updateProfile,getUserProfile,followUser,unfollowUser,getFollowers,getFollowing } from "../controllers/userController.js";
import  authMiddleware  from "../middlewares/authMiddleware.js"
import { searchUsers } from "../controllers/userController.js";

const router = express.Router()

router.put("/cover-photo", authMiddleware, uploadFile, updateCoverPhoto);
router.put("/update-profile", authMiddleware, uploadFile,updateProfile);
router.get("/search", searchUsers);
router.get("/:userId", getUserProfile);
//router.post("/:id/follow", authMiddleware, followUser);
//router.post("/:id/unfollow", authMiddleware, unfollowUser);
router.get("/:id/followers", authMiddleware, getFollowers);
router.get("/:id/following", authMiddleware, getFollowing);
// Follow a user
router.post("/follow/:userId", authMiddleware, followUser);
// Unfollow a user
router.post("/unfollow/:userId", authMiddleware, unfollowUser);

export default router;  