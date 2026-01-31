import mongoose, { Document } from "mongoose";

export interface UserDocument extends Document {
    fullName: string;
    email: string;
    password: string;
    bio?: string;
    profilePic?: string;
    nativeLanguage?: string;
    learningLanguage?: string;
    location?: string;
    isOnboarded: boolean;
    friends: mongoose.Types.ObjectId[];
  }