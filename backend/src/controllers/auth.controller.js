import cloudinary from "../lib/cloudinary.js";
import { generateToken, sendEmail } from "../lib/utils.js";
import { User, validate } from "../models/user.model.js";
import bcrypt from "bcryptjs";

import Token from "../models/token.js";
import { forgotMessage } from "../lib/forgotMessage.js";
import crypto from "crypto";
import streamifier from 'streamifier';

export const signup = async (req, res) => {
  const { fullName, password, email } = req.body;
  const { error } = validate({ email, fullName, password });
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  try {

    const user = await User.findOne({ email });
   
    if (user) return res.status(400).json({ message: "Email already exits" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
  
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });
   
    if (newUser) {
     
      generateToken(newUser._id, res);
      
      await newUser.save();
     
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        password: newUser.password,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    //delete the jwt token from cookie
    // res.cookie("jwt", "", { maxAge: 0 });
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None": "Strict", // Cross-origin logout
      secure: process.env.NODE_ENV === "production", // Ensure HTTPS in production
      path: "/"
  });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Profile pic is required" });
    }


    // Upload to Cloudinary using a buffer
    const streamUpload = (buffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
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

      const uploadResponse = await streamUpload(req.file.buffer);

    // Delete the temporary file after uploading to Cloudinary
    const userId = req.user._id;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please enter your email " });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No such email found! Please register." });
    }

    let token = await Token.findOne({ userId: user._id });
    

    const resetToken = crypto.randomBytes(20).toString("hex");

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    if (!token) {
      token = await new Token({
        userId: user._id,
        token: resetPasswordToken,
      }).save();
    }

   
    const linkToResetPassword =
      process.env.NODE_ENV === "production"
        ? `${process.env.FRONTEND_URL}/reset-password/${user._id}/${resetToken}`
        : `http://localhost:5173/reset-password/${user._id}/${resetToken}`;

    const message = forgotMessage(linkToResetPassword, user);

    const result = sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: message,
    });

    if (await result)
      return res.status(200).json({
        message: `An email has been sent to ${email} with further instructions.`,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Internal server error in forgotpasswor controller",
        error: error.message,
      });
  }
};

export const resetPassword = async (req, res) => {
  const { resetToken, userId } = req.params;

  const { password: newPassword } = req.body;

  try {
    if (!resetToken || !newPassword || !userId) {
      return res.status(400).json({ message: "Invalid Request" });
    }

    // Hash the token to match with stored token in DB
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const token = await Token.findOne({
      userId,
      token: resetPasswordToken,
    });

    if (!token) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const user = await User.findById(token.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    await token.deleteOne();

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Internal server error in resetPassword controller",
        error: error.message,
      });
  }
};
