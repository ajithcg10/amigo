import express ,{Request,Response} from 'express'
import dotenv from "dotenv"
import authRoutes from './routes/auth.routes'
import { connectDb } from './config/db'




dotenv.config()

const app = express()
const PORT = process.env.PORT

app.use(express.json())

app.use("/api/auth/",authRoutes)

app.listen(PORT,()=>{
    console.log("server is running on port " + PORT)
    connectDb()
} )


