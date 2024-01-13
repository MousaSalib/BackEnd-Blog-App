const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
    const authToken = req.headers.authorization;
    if(authToken) {
        const token = authToken.split(" ")[1]
        try{
            const decodedPayLoad = jwt.verify(token, process.env.SECRET_KEY);
            req.user = decodedPayLoad;
            next()
        } catch (error){
            res.status(401).json({message: "Invalid token"})
        }
    }else{
        res.status(401).json({message: "No token provided, access denied"})
    }
}

function verifyTokenAndAdmin (req, res, next) {
    verifyToken(req, res, () => {
        if(req.user.isAdmin) {
            next()
        }else {
            res.status(403).json({message: "You are not allowed, Only admin"})
        }
    })
}

function verifyTokenAndOnlyUser (req, res, next) {
    verifyToken(req, res, () => {
        if(req.user._id == req.params.id) {
            next()
        } else {
            return res.status(403).json({message: "You are not allowed, Only User himself"})
        }
    })
}

function verifyTokenAndAuthorization (req, res, next) {
    verifyToken(req, res, () => {
        if(req.user._id == req.params.id || req.user.isAdmin) {
            next()
        } else {
            return res.status(403).json({message: "Not allow, User himself or the admin"})
        }

    })
}
module.exports = {
    verifyToken,
    verifyTokenAndAdmin,
    verifyTokenAndOnlyUser,
    verifyTokenAndAuthorization
}