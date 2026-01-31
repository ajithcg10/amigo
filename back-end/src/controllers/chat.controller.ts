import { Request, Response } from "express";
import { generateStreamToken } from "../config/stream";


export async function getStreamToken(req: Request, res: Response) {
    try {
        const token = generateStreamToken(req.user?.id);

        res.status(200).json({ token });
    } catch (error: any) {
        console.log("Error in getStreamToken controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}