// require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Name is Required"],
    maxlength: [50, "Name cannot exceed 50"],
    minlength: [4, "Name should have more than 4 character"],
  },
  email: {
    type: String,
    required: [true, "enter your email"],
    unique: true,
    validate: [validator.isEmail, "Pleaase enter a Valid Email"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [8, "Password length should be greater than 8"],
    // doesn't allow to find select password
    select: false,
  },
  avatar: {
    type: String,
    default: "empty",
  },
  role: {
    type: String,
    default: "User",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

/*
->Pre middleware functions are executed one after another, when each middleware calls next
->The next keyword refer to the next middleware that will run after yours to process the request
->Four types of middleware; 'save', document-function supported by document middleware
*/
userSchema.pre("save", async function (next) {
  // here this refers to the document
  // only hash the password if it has been modified (or is new)-WHEN NOT MODIFIED

  if (!this.isModified("password")) {
    next();
  }
  // if (this.isModified("password")) {
  //   console.log(this.isModified("password"));
  //   next();
  // }
  this.password = await bcrypt.hash(this.password, 10);
});

/*
Instance .methods : methods which require an object of its class to be creaed before it can be called

JWT TOKEN
Basic structure of token is: Header, Payload, Signature
*/
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

//Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  // Generating token
  const resetToken = crypto.randomBytes(20).toString("hex");
  //Hashing and add resetPassword to user Schema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; //milliseconds

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
