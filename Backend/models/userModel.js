import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    gender:{
        type: String,
        required: true,
        enum: ["male","female"],
    },
    followers:[
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
    ],
    following:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    profilePic:{
        id: String,
        url: String,
    },
    coverPic: {
        id: String,
        url: String, // URL for the cover photo
    },
    bio: {
        type: String,
        default: "",
        maxlength: 160, // Limiting to 160 characters (similar to Twitter)
      }
},
{
    timestamps: true
});

export const User = mongoose.model("User",userSchema);