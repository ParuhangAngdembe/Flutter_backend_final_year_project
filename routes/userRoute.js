const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateUserDetails,
  getAllUser,
  getSingleUser,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");

const { isUserAuthenticated, authorizedRoles } = require("../middleware/auth");

// Routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/password/reset").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/password/update").put(isUserAuthenticated, updatePassword);
router.route("/me").get(isUserAuthenticated, getUserDetails);
router.route("/me/update").put(isUserAuthenticated, updateUserDetails);
router
  .route("/admin/users")
  .get(isUserAuthenticated, authorizedRoles("admin"), getAllUser);
router
  .route("/admin/user/:id")
  .get(isUserAuthenticated, authorizedRoles("admin"), getSingleUser)
  .put(isUserAuthenticated, authorizedRoles("admin"), updateUserRole)
  .delete(isUserAuthenticated, authorizedRoles("admin"), deleteUser);

// router.route("/password/reset/:token").post(forgotPassword).put(resetPassword);

module.exports = router;
