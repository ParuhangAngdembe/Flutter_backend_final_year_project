const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductDetails,
  createProducts,
  updateProducts,
  deleteProducts,
  createProductReview,
  deleteReview,
  getProductReviews,
  getAdminProducts,
} = require("../controllers/productController");
const { isUserAuthenticated, authorizedRoles } = require("../middleware/auth");

// Route!!!
router.route("/").get(getAllProducts);
router
  .route("/admin/products")
  .get(isUserAuthenticated, authorizedRoles("admin"), getAdminProducts);
router.route("/product-details/:id").get(getProductDetails);

router
  .route("/admin/product/new")
  .post(isUserAuthenticated, authorizedRoles("admin"), createProducts);

router
  .route("/admin/product/:id")
  .put(isUserAuthenticated, authorizedRoles("admin"), updateProducts)
  .delete(isUserAuthenticated, authorizedRoles("admin"), deleteProducts);

router.route("/review").put(isUserAuthenticated, createProductReview);

router
  .route("/reviews")
  .get(isUserAuthenticated, getProductReviews)
  .delete(isUserAuthenticated, deleteReview);

module.exports = router;
