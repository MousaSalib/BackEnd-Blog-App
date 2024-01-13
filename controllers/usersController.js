const asyncHandler = require('express-async-handler');
const {User, validateUpdateUser} = require("../models/User.js");
const bycrypt = require("bcrypt");
const path = require("path");
const fs = require("fs")
const { cloudinaryUploadImage, cloudinaryDeleteImage, cloudinaryRemoveMultipleImage } = require("../utils/cloudinary.js");
const { Post } = require('../models/Post.js');
const { Comment } = require('../models/Comment.js');

module.exports.getAllUsersCtrl = asyncHandler(async(req, res) => {
    const users = await User.find().select("-password").populate("posts")
    res.status(200).json({message: "Welcome", users})
});

module.exports.getUserCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password").populate("posts");
    if(!user) {
        return res.status(404).json({message: "User not found"})
    }
    res.status(200).json(user)
})

module.exports.updateUserProfileCtrl = asyncHandler(async(req, res) => {
    let {error} = validateUpdateUser(req.body);
    if(error) {
        return res.status(400).json({message: error.details[0].message})
    }
    if(req.body.password) {
        const salt = await bycrypt.genSalt(10);
        req.body.password = await bycrypt.hash(req.body.password, salt)
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
        $set: {
            username: req.body.username,
            password: req.body.password,
            bio: req.body.bio
        }
    }, {new: true}).select("-password")
    res.status(200).json(updatedUser)
});

module.exports.getUsersCountCtrl = asyncHandler(async(req, res) => {
    const count = await User.countDocuments();
    res.status(200).json(count)
});

module.exports.uploadUserProfilePhotoCtrl = asyncHandler(async(req, res) => {
    if(!req.file) {
        return res.status(400).json({message: "No files provided"});
    }

    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);

    const user = await User.findById(req.user._id);
    if(user.profilePhoto.publicId !== null) {
        await cloudinaryDeleteImage(user.profilePhoto.publicId)
    }

    user.profilePhoto = {
        url: result.secure_url,
        publicId: result.public_id
    }
    await user.save();
    res.status(200).json({message: "Your profile photo uploaded successfully", profilePhoto: {url : result.secure_url, publicId: result.public_id}});
    fs.unlinkSync(imagePath)
});

module.exports.deleteUserProfileCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if(!user) {
        return res.status(404).json({message: "User not found"});
    }

    const posts = await Post.find({user: user._id});
    const publicIds = posts?.map((post) => post.image.publicId);
    if(publicIds?.length > 0) {
        await cloudinaryRemoveMultipleImage(publicIds)
    }

    await cloudinaryDeleteImage(user.profilePhoto.publicId);
    await Post.deleteMany({user: user._id});
    await Comment.deleteMany({user: user._id})

    await User.findByIdAndDelete(req.params.id)
    res.status(200).json({message: "Your profile has been deleted successfully"})
})