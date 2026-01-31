import { Request, Response } from "express";
import User from "../models/User";
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs"; 
import { upsertStreamUser } from "../config/stream";

export  async function signup (req:Request,res:Response){
   const {fullName,email,password} = req.body

   try {
    if (!email || !password || !fullName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists, please use a diffrent one" });
      }

     const idx = Math.floor(Math.random() * 100) + 1; // generate a num between 1-100
     const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

     const newUser =  await User.create({
        email,
        fullName,
        password,
        profilePic:randomAvatar
     })

     try {
        await upsertStreamUser({
          id: newUser._id.toString(),
          name: newUser.fullName,
          image: newUser.profilePic || "",
        });
        console.log(`Stream user creating Stream User: ${newUser.fullName}`);
        
      } catch (error) {
        console.error("Failed to creating Stream user", error);
      }
      



     const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
    }
     const token = jwt.sign({userId:newUser._id},jwtSecret,{expiresIn:"2d"})

     res.cookie("jwt" ,token,{
        maxAge:2 * 24 * 60 * 60 * 1000,
        httpOnly:true, //prevent xss attacks,
        sameSite:"strict", //prevent CSRF attacks
        secure:process.env.NODE_ENV === 'production'
     })

     res.status(201).json({sucess:true ,user:newUser})
    
   } catch (error) {
    console.log("Error in Siginup controller",error)
    res.status(500).json({message:'Internal Server Error'})
    
   }
}

export async function login(req:Request,res:Response){
    try {
        const {email,password} = req.body

        if (!email || !password ) {
            return res.status(400).json({ message: "All fields are required" });
          }
        const user = await User.findOne({email})
        if(!user) return res.status(401).json({message:"Invalid email or password"})
        const isPasswordCorrect = await bcrypt.compare(password,user.password)
        if(!isPasswordCorrect)  return res.status(401).json({message:"Invalid email or password"})
        
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not defined");
        }
        
        const token = jwt.sign({userId:user._id},jwtSecret,{expiresIn:"2d"})

        res.cookie("jwt" ,token,{
            maxAge:2 * 24 * 60 * 60 * 1000,
            httpOnly:true, //prevent xss attacks,
            sameSite:"strict", //prevent CSRF attacks
            secure:process.env.NODE_ENV === 'production'
            })
        
        res.status(200).json({sucess:true,user})

    } catch (error) {
        console.log("Error in login controller", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
}


export async function logout (req:Request,res:Response){
    res.clearCookie("jwt")
    res.status(200).json({sucess:true, message:"Logout successfull"})
}


export async function onborad(req:Request,res:Response) {
    try {
      const userId = req.user?._id
      const {fullName,bio,nativeLanguage,learningLanguage,location} = req.body

      if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
        return res.status(400).json({
          message: "All fields are required",
          missingFields: [
            !fullName && "fullName",
            !bio && "bio",
            !nativeLanguage && "nativeLanguage",
            !learningLanguage && "learningLanguage",
            !location && "location",
          ].filter(Boolean),
        });
      }

      const updateUser = await User.findByIdAndUpdate(userId,{
        ...req.body,
        isOnboarded:true
      },{new:true})
      if (!updateUser) return res.status(404).json({ message: "User not found" });

    try {
      await upsertStreamUser({
        id: updateUser._id.toString(),
        name: updateUser.fullName,
        image: updateUser.profilePic || "",
      });
      console.log(`Stream user updated after onboarding for ${updateUser.fullName}`);
    } catch (streamError:any) {
      console.log("Error updating Stream user during onboarding:", streamError?.message );
    }

    res.status(200).json({ success: true, user: updateUser });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }

}