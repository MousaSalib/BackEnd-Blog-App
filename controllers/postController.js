const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const {Post, validateCreatePost, validateUpdatePost} = require("../models/Post.js");
const {cloudinaryUploadImage, cloudinaryDeleteImage} = require("../utils/cloudinary.js");
const { Comment } = require("../models/Comment.js");

module.exports.createPostCtrl = asyncHandler(async(req, res) => {
    if(!req.file) {
        return res.status(404).json({message: "No file provided"});
    }

    const {error} = validateCreatePost(req.body);
    if(error) {
        return res.status(400).json({message: error.details[0].message})
    }

    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath)

    const post = await Post.create({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        user: req.user._id,
        image: {
            url: result.secure_url,
            publicId: result.public_id
        }
    })
    res.status(200).json(post);

    fs.unlinkSync(imagePath)
});

module.exports.getAllPostCtrl = asyncHandler(async(req, res) => {
    const POST_PER_PAGE = 3;
    const {pageNumber, category} = req.query;
    let posts;
    if(pageNumber) {
        posts = await Post.find().skip((pageNumber - 1) * POST_PER_PAGE).limit(POST_PER_PAGE).sort({createdAt: -1}).populate("user", ["-password"])
    } else if(category) {
        posts = await Post.find({category}).sort({createdAt: -1}).populate("user", ["-password"])
    } else {
        posts = await Post.find().sort({createdAt: -1}).populate("user", ["-password"])
    }
    res.status(200).json(posts)
});

module.exports.getSinglePostCtrl = asyncHandler(async(req, res) => {
    const post = await Post.findById(req.params.id).populate("user", ["-password"]).populate("comments");
    if(!post) {
        return res.status(404).json("Post not found")
    }
    res.status(200).json(post)
});

module.exports.getPostCountCtrl = asyncHandler(async(req, res) => {
    const count = await Post.countDocuments();
    if(!count) {
        return res.status(404).json({message: "Not posts founded"})
    }
    res.status(200).json(count)
});

module.exports.deletePostCtrl = asyncHandler(async(req, res) => {
    const post = await Post.findById(req.params.id);

    if(!post) {
        return res.status(404).json({message: "Not post found"})
    }
    if(req.user.isAdmin || req.user._id === post.user.toString()) {
        await Post.findByIdAndDelete(req.params.id);
        await cloudinaryDeleteImage(post.image.publicId);
        await Comment.deleteMany({postId: post._id})

        res.status(200).json({message: "Post has been deleted successfully", postId: post._id})
    } else{
        res.status(403).json({message: "Access denied, forbidden"})
    }
});

module.exports.updatePostCtrl = asyncHandler(async(req, res) => {
    const {error} = validateUpdatePost(req.body);
    if(error) {
        return res.status(400).json({message: error.details[0].message})
    }

    const post = await Post.findById(req.params.id);

    if(!post) {
        return res.status(404).json({message: "Post not found"})
    }

    if(req.user._id !== post.user.toString()) {
        return res.status(403).json({message: "Access denied, You are not allowed"})
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
        $set: {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category
        }
    }, {new: true}).populate("user")
    res.status(200).json(updatedPost)
});

module.exports.updatePostImageCtrl = asyncHandler(async(req, res) => {
    
    if(!req.file) {
        return res.status(404).json({message: "No image found"})
    }

    const post = await Post.findById(req.params.id);

    if(!post) {
        return res.status(404).json({message: "Post not found"})
    }

    if(req.user._id !== post.user.toString()) {
        return res.status(403).json({message: "Access denied, You are not allowed"})
    }

    await cloudinaryDeleteImage(post.image.publicId);
    
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
        $set: {
            image: {
                url: result.secure_url,
                publicId: result.public_id
            }
        }
    }, {new: true});
    res.status(200).json(updatedPost)

    fs.unlinkSync(imagePath)
});

module.exports.toggleLikesCtrl = asyncHandler(async(req, res) => {
    const loggedInUser = req.user._id;
    const {id: postId} = req.params
    let post = await Post.findById(postId);
    if(!post) {
        return res.status(404).json({message: "Post is not found"})
    }

    const isPostAlreadyLiked = post.likes.find((user) => user.toString() === loggedInUser);

    if(isPostAlreadyLiked) {
        post = await Post.findByIdAndUpdate(postId, {
            $pull: {likes: loggedInUser}
        }, {new: true})
    }else {
        post = await Post.findByIdAndUpdate(postId, {
            $push: {likes: loggedInUser}
        }, {new: true})
    }
    res.status(200).json(post)
})
