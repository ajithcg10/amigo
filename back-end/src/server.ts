import express, { Request, Response } from 'express'
import dotenv from "dotenv"
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.route'
import chatRoutes from './routes/chat.routes'
import { connectDb } from './config/db'
import cookieParser from 'cookie-parser'




dotenv.config()

const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth/", authRoutes)
app.use("/api/user/", userRoutes)
app.use("/api/chat/", chatRoutes)

app.listen(PORT, () => {
    console.log("server is running on port " + PORT)
    connectDb()
})


