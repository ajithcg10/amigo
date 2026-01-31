import express from "express";
import { protectRouter } from "../middleware/auth.middleware";
import { getMyFriends, getOutgoingFriendRequest, getRecommendedUsers, sendFriendRequest, statusFriendRequest } from "../controllers/user.controller";




const router = express.Router()

//apply all auth middleware to all routes
router.use(protectRouter)

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);
router.post("/friend-request/:id", sendFriendRequest);
router.post("/friend-request/:id/status", statusFriendRequest);
router.post("/outgoing-friend-requests", getOutgoingFriendRequest);




export default router