// Creating Token and Saving in Cookie
const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  //options for cookies
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};

module.exports = sendToken;
/* Note:
  HttpOnly is a flag added to cookies that tell the browser not to display the cookie through client-side scripts (document.cookie and others). the fundamental benefit of having an XSS vulnerability (the ability steal cookies and hijack a currently established session) is lost. When you set a cookie with the HttpOnly flag, it informs the browser that this special cookie should only be accessed by the server.
*/
