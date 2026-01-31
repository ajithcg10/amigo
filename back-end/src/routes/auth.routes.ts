import express, { Request, Response } from 'express'
import { login, logout, onborad, signup } from '../controllers/auth.controller'
import { protectRouter } from '../middleware/auth.middleware'


const router = express.Router()


router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)
router.post("/onborading",protectRouter,onborad)
router.get("/me",protectRouter,(req:Request,res:Response)=>{
    res.status(200).json({succes:true,user:req.user})
} )



export default router