import { StreamChat, UserResponse } from "stream-chat";
import "dotenv/config"

const apiKey = process.env.STREAM_API_KEY

const apiSecret = process.env.STREAM_SECRET_KEY

if (!apiKey || apiSecret) {
    console.error("Stream apiKey or stream secretkey is missing");

}


const streamClient = StreamChat.getInstance(apiKey as string, apiSecret)

export const upsertStreamUser = async (userData: UserResponse) => {
    try {
        await streamClient.upsertUsers([userData])
        return userData
    } catch (error) {
        console.error("Error upserting Stream user:", error);

    }
}

export const generateStreamToken = (userId: string) => {
    try {
        // ensure userId is a string
        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr);
    } catch (error) {
        console.error("Error generating Stream token:", error);
    }
};