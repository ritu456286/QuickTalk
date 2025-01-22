import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import dotenv from 'dotenv';
dotenv.config();


export const generateToken = (userId, res) => {
    //generate JWT token
   
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: "7d"
    })
  

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, //MS
        httpOnly: true, //prevent XSS attacks [cross-site scripting attacks]
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict" , //CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV === "production" //sets to true in production mode for https, and false in test mode for http in localhost
    })

    return token;
}



export const sendEmail = async (options) => {
   
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 465,
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        // console.log("TO:", options.to);
        const mailOptions = {
            from: `"Chatty Team" <${process.env.SMTP_EMAIL}`,
            to: options.to,
            subject: options.subject,
            text: options.text,
        };

        return transporter.sendMail(mailOptions);
   
}