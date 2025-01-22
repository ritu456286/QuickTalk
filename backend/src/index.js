import express from "express"
import dotenv from "dotenv";
import cookieParser from "cookie-parser"
import cors from "cors"

import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

// import path from "path";

import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"


dotenv.config()

const PORT = process.env.PORT || 5001;
// const __dirname = path.resolve();

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

// if(process.env.NODE_ENV==="production"){
//     app.use(express.static(path.join(__dirname, "../frontend/dist")))

//     app.get("*", (req, res) => {
//         res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
//     })
// }

server.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
    connectDB()
})