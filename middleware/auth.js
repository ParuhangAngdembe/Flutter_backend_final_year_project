const ErrorHandler = require("../utils/errohandler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const isUserAuthenticated = async (req, res, next) => {
  // cookie-parser parses Cookie header and populates req.cookies with an object keyed by the cookie names.
  const { token } = req.cookies;
  //   console.log(token);
  //   return "abcd";

  if (!token) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }
  const decodeData = jwt.verify(token, process.env.JWT_SECRET);

  // as long as the user is authenticated we can access 'request' user data
  // findById because the token was made by signing the id ....
  req.user = await User.findById(decodeData.id);
  next();
};

const authorizedRoles = (...roles) => {
  return (req, res, next) => {
    /*
    (req.user.role) = ["admin"]
    'roles' yo roles chai mathi thena bhane(!roles)
    */
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role:${req.user.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { isUserAuthenticated, authorizedRoles };
