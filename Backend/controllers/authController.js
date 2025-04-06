import {User} from "../models/userModel.js"
import generateToken from "../utils/generateToken.js";
import TryCatch from "../utils/TryCatch.js";
import getDataUrl from "../utils/urlGenerator.js";
import bcrypt from 'bcrypt'
import cloudinary from "cloudinary"


export const registerUser = TryCatch(async (req, res) => {
    const { name, email, password, gender } = req.body;
    const file = req.file;
  
    // Validation
    if (!name || !email || !password || !gender || !file) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    if (name.length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
  
    if (password.length < 6 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters and include one uppercase letter and one number",
      });
    }
  
    if (!["male", "female"].includes(gender)) {
      return res.status(400).json({ message: "Invalid gender value" });
    }
  
    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      return res.status(400).json({ message: "File size must be less than 2MB" });
    }
  
    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
  
    // Process registration
    const fileUrl = getDataUrl(file);
    const hashPassword = await bcrypt.hash(password, 10);
    const myCloud = await cloudinary.v2.uploader.upload(fileUrl.content);
  
    const user = await User.create({
      name,
      email,
      password: hashPassword,
      gender,
      profilePic: {
        id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });
  
    generateToken(user._id, res);
    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  });

export const loginUser = TryCatch(async(req,res)=>{

    const {email,password}=req.body
    const user=await User.findOne({email})
    .populate("followers", "name profilePic")
    .populate("following", "name profilePic");

    if(!user)
        return res.status(404).json({
            message: "no user found",
        })

    const comparePassword = await bcrypt.compare(password, user.password)
    if(!comparePassword)
        return res.status(400).json({
            message: "Wrong password",
        })

    const token =  generateToken(user._id,res)
    res.json({
        message: "user logged in",
        user,
        token
    })

})

export const logoutUser =TryCatch((req,res) => {
    res.cookie("token","",{maxAge:0})

    res.json({
        message: "logged out"
    })

})

// export const updateCoverPhoto = TryCatch(async (req, res) => {
//     console.log("Reached the update cover photo endpoint");
//     const user = await User.findById(req.user._id);

//     if (!user) {
//         return res.status(404).json({ message: "User not found" });
//     }

//     const coverFile = req.file;
//     if (!coverFile) {
//         return res.status(400).json({ message: "No cover photo uploaded." });
//     }

//     const fileUrl = getDataUrl(coverFile);
//     const myCloud = await cloudinary.v2.uploader.upload(fileUrl.content);

//     user.coverPic = {
//         id: myCloud.public_id,
//         url: myCloud.secure_url
//     };
//     await user.save();

//     res.json({
//         message: "Cover photo updated successfully!",
//         coverPic: user.coverPic,
//     });
// });

export const updateCoverPhoto = TryCatch(async (req, res) => {
    console.log("Reached the update cover photo endpoint"); // Debugging

    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const coverFile = req.file;
    if (!coverFile) {
        return res.status(400).json({ message: "No cover photo uploaded." });
    }

    // Convert file to URL
    const fileUrl = getDataUrl(coverFile);
    const myCloud = await cloudinary.v2.uploader.upload(fileUrl.content);

    // Update cover photo in user model
    user.coverPic = {
        id: myCloud.public_id,
        url: myCloud.secure_url
    };
    await user.save();

    res.json({
        message: "Cover photo updated successfully!",
        coverPic: user.coverPic,
    });
});