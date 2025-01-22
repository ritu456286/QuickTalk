import {User} from "../models/user.model.js";
import Message from "../models/message.model.js"
import cloudinary from "../lib/cloudinary.js";

import { getSocketId } from "../lib/socket.js";
import {io} from "../lib/socket.js"
import streamifier from 'streamifier';

//GET: All users excepts the current loggedIn user
export const getUsersForSidebar = async(req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getUserForSidebar controller: ", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}

//get all messages for a particular user
export const getMessages = async(req, res) => {
    try {
        const {id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: myId}
            ]
        })

        res.status(200).json(messages)
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}

//
export const sendMessage = async(req, res) => {
    try {
        //first parse the multipart data using multer
   
        const { text } = req.body;
        const image = req.file;
        
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
           
            const streamUpload = (buffer) =>
                new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'auto' },
                    (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                    }
                );
                streamifier.createReadStream(buffer).pipe(stream);
                });

            const uploadResponse = await streamUpload(image.buffer);

            imageUrl = uploadResponse.secure_url;

        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });
      
        await newMessage.save();

        //reatime functionality goes here => socket.io
        const receiverSocketId = getSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}