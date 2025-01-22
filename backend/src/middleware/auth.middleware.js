import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"

export const protectRoute = async ( req, res, next) => {
    try {
        //read cookies from req - incoming data from client
       
        const token = req.cookies.jwt;
        if(!token){
            //401 - Unauthorized
            return res.status(401).json({ message: "Unauthorized - No token Provided"})
        }

        //decode the userId i.e payload from the jwt
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if(!decoded){
            return res.status(401).json({ message: "Unauthorized - Invalid Token"})
        }

        //all checks passed, find the user from the database
        const user = await User.findById(decoded.userId).select("-password"); //do not fetch the password field

        if(!user){
            //404 - Requested resources not found
            return res.status(404).json({ message: "User not found"})
        }

        //add the user in req, because this is a middleware, and send this to other routes
        req.user = user

        next();

    } catch (error) {
        console.log("Error in protectRouter middleware", error.message);
        res.status(500).json({message: "Internal Server Error"})
    }
    
}