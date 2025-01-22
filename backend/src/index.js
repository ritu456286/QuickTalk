import express from "express"
import dotenv from "dotenv";
import cookieParser from "cookie-parser"
import cors from "cors"

import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"


dotenv.config()

const PORT = process.env.PORT || 5001;

//extract json data out of req.body
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({limit: "10mb", extended: true})) 
//allows us to parse the cookies, so as to grab data from cookies like jwt token
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}
))


app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

server.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
    connectDB()
})