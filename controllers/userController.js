const User = require("../models/user");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer")
const cloudinary = require("cloudinary");

// common methods
const sendToken = async (token, res, user) => {
    const options = {
        expires: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }
    return res.cookie("token", token, options).json({ success: true, token: token, user })

}

// register user API
exports.registerUser = async (req, res) => {
    try {
        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        })

        const { name, email, password } = req.body;

        const email1 = await User.find({ email: req.body?.email })
        if (email1?.length) {
            return res.json({ success: false, message: "Email is already taken. Please try another email" })
        }

        const user = await new User({
            name,
            email,
            password,
            avatar: {
                public_id: result.public_id,
                url: result.secure_url
            }

        });
        const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        })
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body?.password, salt);
        await user.save()
       
        return res.json({ success: true, token: token, user })

    } catch (error) {
        return res.json({ success: false, message: "Some internal error occur" })
    }
}

// Login user API
exports.loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;
        const user = await User.find({ email: email }).select("+password");
        if (!user?.length) {
            return res.json({ success: false, message: "User is not registered! Please Signup first" })
        }
        const isMatch = await bcrypt.compare(password, user[0]?.password)
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid email or password" })
        }
        const token = await jwt.sign({ id: user[0]._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        })
        return res.json({ success: true, token: token, user })
    } catch (error) {
        return res.json({ success: false, message: "Some internal server error", error: error })
    }
}


// logout user 
exports.logoutUser = async (req, res) => {
    try {
        const options = {
            expires: new Date(Date.now()),
            httpOnly: true
        }
        return res.cookie("token", null, options).json({ success: true, message: "User logout successfully" })
    } catch (error) {
        return res.json({ success: false, message: "Internal server error", error: error })
    }
}

// forget password
exports.forgetPassword = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.find({ email })
        if (!user?.length) {
            return res.json({ success: false, message: "User is not registered with this email. Please Signup first" })
        }
         // generate token
        const resetToken = crypto.randomBytes(16).toString('hex')
         // hash and set to resetPasswordToken
        user[0].resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        // set token expire time
        user[0].resetPasswordExpire = Date.now() + 30 * 60 * 1000
        await user[0].save()
        const url = `${process.env.URL}/reset/password/${resetToken}`
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_FROM,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        const mailOptions = {
            from: `noreply@gmail.com <${process.env.EMAIL_FROM}>`, // sender address
            to: user[0]?.email, // list of receivers
            subject: 'Reset password for your Hawkers Account', // Subject line
            html: `<p>Please follow the following link to reset you password <br/> ${url}</p>`// plain text body
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                return res.json({ success: false, message: "Some error ocuur while sending email" })
            }
            else {
                return res.json({ success: true, message: `Email is send on ${req.body?.email}. Please check your email and reset your password` })
            }
        });
    } catch (error) {
        return res.json({ success: false, message: "Some internal server occur" })
    }

}

// reset password
exports.resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash("sha256").update(req.params?.token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        })
        if (!user) {
            return res.json({ success: false, message: "reset token is invalid or has been expired" })
        }
        if (req.body.password !== req.body?.confirmPassword) {
            return res.json({ success: false, message: "Passwords do not match" })
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body?.password, salt)
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save()
        return res.json({ success: true, message: "Password updated successfully", data: user })

    } catch (error) {
        return res.json({ success: false, message: "Some internal server occur"})
    }
}

// get authorized user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req?.user?.id })
        if (!user) {
            return res.json({ success: false, message: "User profile not found" })
        }
        return res.json({ success: true, message: "User profile found successfully", data: user })
    } catch (error) {
        return res.json({ success: false, message: "Some internal error occur", error: error })
    }
}

// update password of loggedin user
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.find({ _id: req.user.id }).select("+password")
        if (!user.length) {
            return res.json({ success: false, message: "User is not Authorized" })
        }
        const isMatch = await bcrypt.compare(req.body?.oldPassword, user[0]?.password)
        if (!isMatch) {
            return res.json({ success: false, message: "old password is incorrect" })
        }
        const salt = await bcrypt.genSalt(10)
        user[0].password = await bcrypt.hash(req.body?.password, salt);
        await user[0].save()
        return res.json({ success: true, message: 'Password updated successfully' })
    } catch (error) {
        return res.json({ success: false, message: "Some internal server error occur" })
    }
}

// update user profile 
exports.updateProfile = async (req, res) => {
    try {
        if (!Object.keys(req.body)?.length) {
            return res.json({ success: false, message: "Please enter some data to update your profile" })
        }
        const newUserData = {
            name: req.body.name,

        }
        if (req.body?.avatar != "") {
            const user = await User.findById(req.user.id);
            const img_id = user.avatar.public_id;
            const result_data = await cloudinary.v2.uploader.destroy(img_id)
            const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
                folder: "avatars",
                width: 150,
                crop: "scale",
            })

            newUserData.avatar = {
                public_id: result.public_id,
                url: result.secure_url
            }

        }
        const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        })
        // update image is still todo
        return res.json({ success: true, message: "Profile updated successfully", data: user })
    } catch (error) {
        return res.json({ success: false, message: "Some internal server error", error: error })
    }
}

// Get all user by admin
exports.allUsers = async (req, res) => {
    try {
        const users = await User.find();
        if (!users?.length) {
            return res.json({ success: false, message: "Currently no user in the system" })
        }
        return res.json({ success: true, message: "Users found successfully", data: users })

    } catch (error) {
        return res.json({ success: false, message: "Some internal server error", error: error })
    }
}

// Get a specific user by Admin
exports.singleUser = async (req, res) => {
    try {
        const user = await User.find({ _id: req.params?.id })
        if (!user?.length) {
            return res.json({ success: false, message: `No user of this id ${req.user.id} is found` })
        }
        res.json({ success: true, message: "User found successfully", data: user })
    } catch (error) {
        return res.json({ success: false, message: "Some internal server error occur", error: error })
    }
}

// update user by admin
exports.updateUser = async (req, res) => {
    try {
        const user = await User.find({ _id: req.params.id })
        if (!user?.length) {
            return res.json({ success: false, message: `No user with this id ${req.params.id} is found` })
        }
        const updateUser = await User.findByIdAndUpdate(req.params?.id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        })
        return res.json({ success: true, message: "User profile has updated successfully", data: updateUser })
    } catch (error) {
        return res.json({ success: false, message: "Some internal error occur", error: error })
    }
}

// delete user by admin

exports.deleteUser = async (req, res) => {
    try {
        const role = await User.findById({ _id: req.params.id })
        if (role.role == 'admin') {
            return res.json({ success: false, message: "You can not delete Admin Account" })
        }
        const user = await User.findByIdAndRemove({ _id: req.params.id })
        if (!user) {
            return res.json({ success: false, message: `User with this id ${req.params.id} is not found` })
        }
        return res.json({ success: true, message: "User deleted successfully", data: user })
    } catch (error) {
        return res.json({ success: false, message: "Some internal error occur", error: error })
    }
}