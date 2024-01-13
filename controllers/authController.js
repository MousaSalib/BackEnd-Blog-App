const handlerAsync = require('express-async-handler');
const bcrypt = require('bcrypt');
const {User, validateRegisterUser, validateLoginUser} = require("../models/User.js");

module.exports.registerUserCtrl = handlerAsync(async(req, res) => {
    const {error} = validateRegisterUser(req.body);
    if(error) {
        return res.status(400).json({message: error.details[0].message})
    }

    let user = await User.findOne({email: req.body.email});
    if(user) {
        return res.status(400).json({message: "User already exist"})
    }
    let salt = await bcrypt.genSalt(10);
    let hashPassword = await bcrypt.hash(req.body.password, salt);
    user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashPassword
    });
    await user.save();
    res.status(201).json({message: "You registered successfully"})
})

module.exports.loginUserCtrl = handlerAsync(async(req, res) => {
    let {error} = validateLoginUser(req.body);
    if(error) {
        return res.status(400).json({message: error.details[0].message});
    }
    let user = await User.findOne({email: req.body.email});
    if(!user) {
        return res.status(401).json({message: "User is not found"})
    }
    let isPasswordMatched = await bcrypt.compare(req.body.password, user.password);
    if(!isPasswordMatched) {
        return res.status(400).json({message: "Password is wrong"})
    }
    const token = user.generateAuthToken();
    return res.status(200).json({
        _id: user._id,
        isAdmin: user.isAdmin,
        profilePhoto: user.profilePhoto,
        token
    })
})