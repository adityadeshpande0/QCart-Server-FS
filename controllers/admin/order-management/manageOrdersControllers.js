const Order = require("..//..//models/Orders");
const Product = require("..//../models/Products");
const User = require("..//../models/User");

exports.getAllActiveOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("products.productId", "title price units image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "All orders retrieved successfully",
      orders,
    });
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
