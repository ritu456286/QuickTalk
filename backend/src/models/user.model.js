import mongoose from "mongoose";
import Joi from "joi";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        fullName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        profilePic: {
            type: String,
            default: "",
        },
      
    },
    { timestamps: true }
);


const User = mongoose.model("User", userSchema);

const validate = (user) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        fullName: Joi.string().required(),
        password: Joi.string().min(6).required(),
        profilePic: Joi.string().allow(""),
        
    })
    return schema.validate(user);
}

export {User, validate};