const express = require("express");
const router = express.Router();

// middleware
const { isAuthorizedUser, authorizedRole , verifyToken} = require("../middleware/auth");

// require products controller methods
const {
  getAllProducts,
  getAdminProducts,
  addProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getPaginatedData,
  createProductReview,
  getProductReviews,
  deleteProductReviews
} = require("../controllers/productController");

// require users controller methods
const {
  registerUser,
  loginUser,
  logoutUser,
  forgetPassword,
  resetPassword,
  getProfile,
  updatePassword,
  updateProfile,
  allUsers,
  singleUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

// require orders controller methods
const {
  createOrder,
  getSingleOrder,
  getMyOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} = require("../controllers/ordersController");

// require validators
const { productValidator } = require("../Validators/productValidator");
const {
  registerValidator,
  loginValidator,
  forgetPasswordValidator,
  resetPasswordValidator,
} = require("../Validators/userValidator");

// product routes
router
  .route("/admin/addProducts")
  .post(
    verifyToken,
    authorizedRole("admin"),
    addProducts
  );
router.route("/getProducts").get(getAllProducts);
router.route("/admin/getProducts").get(getAdminProducts);
router.route("/getSingleProduct/:id").get(getSingleProduct);
router
  .route("/admin/updateProduct/:id")
  .put( verifyToken, authorizedRole("admin"), updateProduct);
router
  .route("/admin/deleteProduct/:id")
  .delete( verifyToken, authorizedRole("admin"), deleteProduct);
router
  .route("/pagination")
  .get(isAuthorizedUser, authorizedRole("admin"), getPaginatedData);

router.route("/review").put(verifyToken, createProductReview);
router.route("/review/:id").get(verifyToken, getProductReviews);
router.route("/review").delete(verifyToken, deleteProductReviews)
// users routes
router.route("/register").post( registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/forgetPassword").post(forgetPassword);
router
  .route("/reset/password/:token")
  .patch( resetPassword);
router.route("/me").get(verifyToken, getProfile);
router
  .route("/password/update")
  .patch(verifyToken, updatePassword);
router.route("/me/update").put(verifyToken, updateProfile);
router
  .route("/admin/allUsers")
  .get(verifyToken, authorizedRole("admin"), allUsers);
router
  .route("/admin/user/:id")
  .get(verifyToken, authorizedRole("admin"), singleUser);
router
  .route("/admin/updateUser/:id")
  .put(verifyToken, authorizedRole("admin"), updateUser);
router
  .route("/admin/deleteUser/:id")
  .delete(verifyToken, authorizedRole("admin"), deleteUser);

// orders route
router.route("/add-order").post(verifyToken, createOrder);
router.route("/order/me").get(verifyToken, getMyOrders);
router.route("/order/:id").get(verifyToken, getSingleOrder);
router
  .route("/admin/all-orders")
  .get(verifyToken, authorizedRole("admin"), getAllOrders);
router
  .route("/admin/order/:id")
  .put(verifyToken, authorizedRole("admin"), updateOrder);
router
  .route("/admin/order/:id")
  .delete(verifyToken, authorizedRole("admin"), deleteOrder);
module.exports = router;
