import express, { Request, Response } from 'express'
import { login, logout, signup } from '../controllers/auth.controller'


const router = express.Router()


router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)



export default router