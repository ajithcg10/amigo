import mongoose from "mongoose";
import { UserDocument } from "../type/userModelType";
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema<UserDocument>(
    {
      fullName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
        minlength: 6,
      },
      bio: {
        type: String,
        default: "",
      },
      profilePic: {
        type: String,
        default: "",
      },
      nativeLanguage: {
        type: String,
        default: "",
      },
      learningLanguage: {
        type: String,
        default: "",
      },
      location: {
        type: String,
        default: "",
      },
      isOnboarded: {
        type: Boolean,
        default: false,
      },
      friends: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    { timestamps: true }
  );
  
  /* 🔹 Password Hash Middleware */
  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
  
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error as Error);
    }
  });
  
  /* 🔹 Model */
  const User = mongoose.model<UserDocument>("User", userSchema);
  
  export default User;