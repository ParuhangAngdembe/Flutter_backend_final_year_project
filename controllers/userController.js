const asyncErrorWrapper = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errohandler");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
// const { find } = require("../models/userModel");
const cloudinary = require("cloudinary");
const path = require("path");

// Register a User
const registerUser = asyncErrorWrapper(async (req, res, next) => {
  // res.send("register page");
  // const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
  //   folder: "avatars",
  //   width: 150,
  //   crop: "scale",
  // });
  const { username, email, password, avatar } = req.body;

  const user = await User.create({
    username,
    email,
    password,
    avatar,
  });

  sendToken(user, 201, res);
});

// Login User
const loginUser = asyncErrorWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  // checking if user has given password and email both
  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email and Password"));
  }

  // "+password" because 'select' is false in model
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  const passwordMatch = await user.comparePassword(password);
  if (!passwordMatch) {
    return next(new ErrorHandler("Invlaid Email or Password", 401));
  }

  sendToken(user, 200, res);
  // const token = user.getJWTToken();
  // res.status(200).json({
  //   success: true,
  //   token,
  // });
});

// Logout User
const logoutUser = asyncErrorWrapper(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Forgot Password
const forgotPassword = asyncErrorWrapper(async (req, res, next) => {
  // const email = req.body.email;
  console.log(req.body.email);
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // const resetPasswordUrl = `http://localhost/api/v1/password/reset/${resetToken}`;
  // const resetPasswordUrl = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/v1/password/reset/${resetToken}`;

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `Your password reset token is: \n ${resetPasswordUrl}.\n Please ignore if this wasn't you`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Reset Password`,
      message,
    });
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // validateBeforeSave: true, esle chai hamro schema ma gaera sabaia validate garcha, 'false' garyo bhane chai tini haru herdaina cause hamlai password chage matrai garnnu parne ho. tesko lagi ni affnai arkai function cha, ani save garda password matrai save garnu parne ho.
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
    // return res.status(404).json({
    //   success: false,
    // });
  }
});

// Reset Password
const resetPassword = asyncErrorWrapper(async (req, res, next) => {
  // Token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Reset Password token is  invalid or has been expired")
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Your Password Doesn't Match"));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  // Login after change password
  // sendToken(user, 200, res);
  res.status(200).json({
    success: true,
  });
});

// Update Password
const updatePassword = asyncErrorWrapper(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatch = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatch) {
    return next(new ErrorHandler("Old Passowrd Does Not Match", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password Doesn't Match", 400));
  }

  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res);
});

// Get User Details
const getUserDetails = asyncErrorWrapper(async (req, res, next) => {
  // can only be acessed by users that are loged-in
  // auth.js -> if logged in user is saved in 'user'
  const user = await User.findById(req.user.id);
  res.status(200).json({
    user,
  });
});

// Update User Details
const updateUserDetails = asyncErrorWrapper(async (req, res, next) => {
  const newUserData = {
    username: req.body.username,
    email: req.body.email,
  };

  // if (req.body.avatar !== "") {
  //   const user = await User.findById(req.user.id);

  //   const imageId = user.avatar.public_id;

  //   await cloudinary.v2.uploader.destroy(imageId);

  //   const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
  //     folder: "avatars",
  //     width: 150,
  //     crop: "scale",
  //   });

  //   newUserData.avatar = {
  //     public_id: myCloud.public_id,
  //     url: myCloud.secure_url,
  //   };
  // }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

// Get all users(admin)
const getAllUser = asyncErrorWrapper(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// Get single user (admin)
const getSingleUser = asyncErrorWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Update User Role (admin)
const updateUserRole = asyncErrorWrapper(async (req, res, next) => {
  const userData = {
    username: req.body.username,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, userData, {
    new: true,
    runValidators: true,
    userFindAndModify: false,
  });

  if (!user) {
    return next(
      new ErrorHandler(`User Not Found with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
  });
});

// Delete User (admin)
const deleteUser = asyncErrorWrapper(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User Not Found with id: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, message: "User Deleted Successfully" });
});

// Fullter Upload Image
const photoUpload = asyncErrorWrapper(async (req, res, next) => {
  // console.log(process.env.FILE_UPLOAD_PATH);
  const user = await User.findById(req.params.id);
  const file = req.files.file;

  // console.log(user.username);
  // console.log(user.id);
  // console.log(file);

  if (!user) {
    return `No user found with ${req.params.id}`;
  }

  if (!file) {
    return `Please upload a file`;
  }

  // Make sure the image is a photo and accept any extension of an image
  // if (!file.mimetype.startsWith("image")) {
  //   return next(new ErrorResponse(`Please upload an image`, 400));
  // }

  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`;
  }

  file.name = `photo_${user.id}${path.parse(file.name).ext}`;
  console.log(file.name);

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      //console.err(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    //insert the filename into database
    await User.findByIdAndUpdate(req.params.id, {
      avatar: file.name,
    });
  });

  res.status(200).json({
    success: true,
    data: file.name,
  });
});
module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  updatePassword,
  getUserDetails,
  updateUserDetails,
  getAllUser,
  getSingleUser,
  updateUserRole,
  deleteUser,
  photoUpload,
};
