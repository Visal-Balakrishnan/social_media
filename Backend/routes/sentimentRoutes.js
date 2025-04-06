import express from "express";
import { getSentimentReport } from "../controllers/sentimentController.js";
import  authMiddleware  from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:userId", getSentimentReport);

export default router;
