import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: [process.env.FRONTEND_URL]
    }
 });
 
 export function getSocketId(userId) {
    return userSocketMap[userId];
 }


//used to store online users
const userSocketMap = {}; //{userId: socketID}


io.on("connection", (socket) => {
    console.log("A user connected,", socket.id);
    
    const userId = socket.handshake.query.userId;
    if(userId) userSocketMap[userId] = socket.id;

    // io.emit will send the even getOnlineUsers with the userIds of online users to all the connected users
    io.emit("getOnlineUsers", Object.keys(userSocketMap))
    socket.on("disconnect", () => {
        console.log("A user disconnected, ", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

export { io, app, server};