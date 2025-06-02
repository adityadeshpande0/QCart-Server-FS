const express = require("express");
const { registerUser } = require("../controllers/auth/registerController");
const { loginUser } = require("../controllers/auth/loginController");
const getProfileDetails = require("../controllers/get-profile-details/getProfileDetails");
const authenticateToken = require("../middlewares/authenticateToken");
const upload = require("../middlewares/upload");

const {
  addProductsController,
} = require("../controllers/admin/product-management/addProductsController");

const getAllProducts = require("../controllers/admin/product-management/getProductsController");
const {
  editProductController,
  deleteProductController,
} = require("../controllers/admin/product-management/productManagementController");
const {
  addAddress,
  updateAddress,
  getAddresses,
  deleteAddress,
} = require("../controllers/user/updateUserProfile");
const {
  placeOrder,
  getAllOrders,
  cancelOrder,
} = require("../controllers/user-orders-management/ordersManagementController");
const {
  getAllActiveOrders,
} = require("../controllers/admin/order-management/manageOrdersControllers");

const router = express.Router();

// POST calls
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post(
  "/add-product",
  authenticateToken,
  upload.single("file"),
  addProductsController
);
router.post("/addaddress", authenticateToken, addAddress);
router.post("/place-order", authenticateToken, placeOrder);

// GET calls
router.get("/user-profile", authenticateToken, getProfileDetails);
router.get("/getAllProducts", getAllProducts);
router.get("/getallAddresses", authenticateToken, getAddresses);
router.get("/get-recent-orders", authenticateToken, getAllOrders);
router.get("/get-orders", authenticateToken, getAllActiveOrders);
// PUT calls
router.put("/edit-product/:id", authenticateToken, editProductController);
router.put("/address/:addressId", authenticateToken, updateAddress);
router.put("/cancel-order/:orderId", authenticateToken, cancelOrder);

// DELETE calls
router.delete(
  "/delete-product/:id",
  authenticateToken,
  deleteProductController
);
router.delete("/delete-address/:addressId", authenticateToken, deleteAddress);

module.exports = router;
