import express from 'express';
import { searchUsers } from '../controllers/searchController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/", authMiddleware,searchUsers);

export default router;