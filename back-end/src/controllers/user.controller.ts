import { Request, Response } from "express";
import User from "../models/User";
import FriendRequest from "../models/FriendReqest";

export async function getRecommendedUsers(req: Request, res: Response) {

    try {
        const currentUserId = req.user?.id
        const currentUser = req.user
        const recommendedUser = User.find(
            {
                $and: [
                    { _id: { $ne: currentUserId } },
                    { _id: { $nin: currentUser?.friends } },
                    { isOnboarded: true }
                ]
            }
        )
        if (!recommendedUser) {
            return res.status(404).json({ message: "recommendedUser not found" });
        }
        res.status(200).json(recommendedUser)

    } catch (error: any) {
        console.log("Error in getRecommendedUsers controller", error.message);
        res.status(500).json({ message: "Internal Server Error" })

    }
}

export async function getMyFriends(req: Request, res: Response) {
    try {
        const user = await User.findById(req.user?.id)
            .select("friends")
            .populate("friends", "fullName profilePic nativeLanguage learningLanguage")

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user.friends)

    } catch (error) {

    }

}


export async function sendFriendRequest(req: Request, res: Response) {
    try {
        const myId = req.user?.id;
        const { id: recipientId } = req.params;

        // prevent sending req to yourself
        if (myId === recipientId) {
            return res.status(400).json({ message: "You can't send friend request to yourself" });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: "Recipient not found" });
        }

        // check if user is already friends
        if (recipient.friends.includes(myId)) {
            return res.status(400).json({ message: "You are already friends with this user" });
        }

        // check if a req already exists
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: myId, recipient: recipientId },
                { sender: recipientId, recipient: myId },
            ],
        });

        if (existingRequest) {
            return res
                .status(400)
                .json({ message: "A friend request already exists between you and this user" });
        }

        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId,
        });

        res.status(201).json(friendRequest);
    } catch (error: any) {
        console.error("Error in sendFriendRequest controller", error?.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}



export async function statusFriendRequest(req: Request, res: Response) {
    try {
        const { id: requestId } = req.params;
        const { status } = req.body;

        // 1️⃣ Validate status
        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value",
            });
        }

        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest) {
            return res.status(404).json({
                success: false,
                message: "Friend request not found",
            });
        }

        // 2️⃣ Authorization
        if (friendRequest.recipient.toString() !== req.user?.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this request",
            });
        }

        // 3️⃣ Reject → delete
        if (status === "rejected") {
            await FriendRequest.findByIdAndDelete(requestId);

            return res.status(200).json({
                success: true,
                message: "Friend request rejected",
            });
        }

        // 4️⃣ Accept → update + add friends
        friendRequest.status = "accepted";
        await friendRequest.save();

        await Promise.all([
            User.findByIdAndUpdate(friendRequest.sender, {
                $addToSet: { friends: friendRequest.recipient },
            }),
            User.findByIdAndUpdate(friendRequest.recipient, {
                $addToSet: { friends: friendRequest.sender },
            }),
        ]);

        return res.status(200).json({
            success: true,
            message: "Friend request accepted",
        });
    } catch (error: any) {
        console.error("Error in statusFriendRequest:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}


export async function getOutgoingFriendRequest(req: Request, res: Response) {
    try {
        const outgoingRequests = await FriendRequest.find({
            sender: req.user?.id,
            status: "pending",
        }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(outgoingRequests);
    } catch (error: any) {
        console.log("Error in getOutgoingFriendReqs controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}