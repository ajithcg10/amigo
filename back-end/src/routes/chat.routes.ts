import express from "express";
import { protectRouter } from "../middleware/auth.middleware";
import { getStreamToken } from "../controllers/chat.controller";


const router = express.Router();

router.get("/token", protectRouter, getStreamToken);

export default router;