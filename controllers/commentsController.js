const asyncHandler = require("express-async-handler")
const { validateCreateComment, Comment, validateUpdateComment } = require("../models/Comment.js");
const { User } = require("../models/User.js");
module.exports.createCommentCtrl = asyncHandler(async(req, res) => {
    let {error} = validateCreateComment(req.body);
    if(error) {
        return res.status(400).json({message: error.details[0].message})
    }
    const profile = await User.findById(req.user._id);

    const comment = await Comment.create({
        postId: req.body.postId,
        text: req.body.text,
        user: req.user._id,
        username: profile.username
    });
    res.status(201).json(comment)
});

module.exports.getAllCommentsCtrl = asyncHandler(async(req, res) => {
    const comments = await Comment.find().populate("user");
    if(!comments) {
        return res.status(404).json({message: "No comment is found"})
    }else {
        res.status(200).json(comments)
    }
});

module.exports.deleteCommentCtrl = asyncHandler(async(req, res) => {
    const comment = await Comment.findById(req.params.id);

    if(!comment) {
        return res.status(404).json({message: "Comment is not found"})
    }

    if(req.user.isAdmin || req.user._id === comment.user.toString()) {
        await Comment.findByIdAndDelete(req.params.id)
        res.status(200).json({message: "Comment has been deleted successfully"})
    }else {
        res.status(403).json({message: "access denied, not allowed"})
    }
});

module.exports.updateCommentCtrl = asyncHandler(async(req, res) => {
    let {error} = validateUpdateComment(req.body);
    if(error) {
        return res.status(400).json({message: error.details[0].message})
    }

    const comment = await Comment.findById(req.params.id);
    if(!comment) {
        res.status(404).json({message: "Comment is not found"})
    }
    if(req.user._id !== comment.user.toString()) {
        res.status(403).json({message: "access denied, Only user himself can edit the comment"})
    }
    const updatedComment = await Comment.findByIdAndUpdate(req.params.id, {
        $set: {
            text: req.body.text
        }
    }, {new: true});
    res.status(200).json(updatedComment)
})