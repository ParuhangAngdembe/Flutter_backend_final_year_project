const ErrorHandler = require("../utils/errohandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  //Wrong MongodDB ID error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Mongoose duplicate key Error
  if (err.code === 11000) {
    const message = `Duplicate ${object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  // JWT Error
  if (err.name === "JasonWebTokenError") {
    const message = `Json Web Token is invlaid`;
    err = new ErrorHandler(message.replace, 400);
  }

  // JWT Expire Error
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is Expired, Try Again`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    error: err.statusCode,
    message: err.message,
  });
};
