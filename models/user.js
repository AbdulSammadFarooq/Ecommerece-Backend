const mongoose = require("mongoose");
const validator = require("validator");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: [true, "Name is required"],
    trim: true,
    maxlength: [20, "Name can not exceed 20 characters"],
  },
  email: {
    type: String,
    // required: [true, "Email is required"],
    // validate: [validator.isEmail, "Please enter valid email address"],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    // required: [true, "Password is required"],
    // minlength: [6, "Password must be at least 6 characters long"],
    select: false,
    trim: true,
  },
 
  avatar: {
    public_id: {
      type: String,
      // required: true,
    },
    url: {
      type: String,
      // required: true,
    },
  },

  role: {
    type: String,
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: {
    type:Date,
  }
});
const User = mongoose.model("user", userSchema)

module.exports =User