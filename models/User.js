const mongoose = require("mongoose");
const Joi = require('joi');
const jwt = require("jsonwebtoken")
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 100,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength:8
    },
    profilePhoto: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
            publicId: null
        }
    },
    bio: {
        type: String
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isAccountVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

UserSchema.virtual("posts", {
    ref: "Post",
    foreignField: "user",
    localField: "_id"
})

UserSchema.methods.generateAuthToken = function() {
    return jwt.sign({_id: this._id, isAdmin: this.isAdmin}, process.env.SECRET_KEY)
}
const User = mongoose.model("User", UserSchema);

const validateRegisterUser = (obj) => {
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100).required(),
        email: Joi.string().min(5).trim().max(100).required().email(),
        password: Joi.string().trim().min(8).required()
    });
    return schema.validate(obj)
}

const validateLoginUser = (obj) => {
    const schema = Joi.object({
        email: Joi.string().required().trim().min(5).max(100).email(),
        password: Joi.string().min(8).trim().required()
    });
    return schema.validate(obj)
}

const validateUpdateUser = (obj) => {
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100),
        password: Joi.string().trim().min(8),
        bio: Joi.string()
    })
    return schema.validate(obj)
}
module.exports = {
    User,
    validateRegisterUser,
    validateLoginUser,
    validateUpdateUser
}