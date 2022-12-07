const User = require("../models/user")
const jwt = require("jsonwebtoken")

// auth user
exports.isAuthorizedUser = async (req, res, next) => {
    const { token } = req.cookies
    if (!token) {
        return res.json({ success: false, message: "Please login first to access the resource" })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    req.user = await User.findById(decoded?.id)
    next()
}

exports.verifyToken = async (req, res, next) => {
    const bearerHeader = req.headers["authorization"]
    if (typeof bearerHeader !== "undefined") {
        const bearer = bearerHeader.split(' ')
        const bearerToken = bearer[1];
        const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET_KEY)
        req.user = await User.findById(decoded?.id)
        next();
    } else {
        return res.json({ success: false, message: "Please login first to access the resource" })

    }
}

// admin 
exports.authorizedRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.json({ success: false, message: `Role ${req.user.role} is not allowed to access this resource` })
        }
        next()
    }
}