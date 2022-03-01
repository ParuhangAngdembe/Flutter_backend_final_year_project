const express = require("express");
const router = express.Router();
const {
  createOrder,
  getSingleOrder,
  myOrder,
  getAllOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");
const { isUserAuthenticated, authorizedRoles } = require("../middleware/auth");

// ROUTES
router.route("/new").post(isUserAuthenticated, createOrder);
// router.route("/new").post(createOrder);
router
  .route("/:id")
  .get(isUserAuthenticated, authorizedRoles("admin"), getSingleOrder);
router.route("/me/myorder").get(isUserAuthenticated, myOrder);

router
  .route("/admin/orders")
  .get(isUserAuthenticated, authorizedRoles("admin"), getAllOrder);

router
  .route("/admin/order/:id")
  .put(isUserAuthenticated, authorizedRoles("admin"), updateOrder)
  .delete(isUserAuthenticated, authorizedRoles("admin"), deleteOrder);

// router.route("/myorder").get(isUserAuthenticated, myOrder);
// order tala mathi huda kina chaldaina

module.exports = router;
