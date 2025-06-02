const Order = require("../../../models/Orders");
const Product = require("../../../models/Products");
const User = require("../../../models/User");

exports.getAllActiveOrders = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const orders = await Order.find()
      .populate("userId", "name email isActive")
      .populate("products.productId", "title price units image")
      .sort({ createdAt: -1 });

    // Group orders by user
    const userOrdersMap = {};

    orders.forEach(order => {
      const userId = order.userId._id;
      if (!userOrdersMap[userId]) {
        userOrdersMap[userId] = {
          userDetails: {
            id: userId,
            name: order.userId.name,
            email: order.userId.email,
            isActive: order.userId.isActive,
          },
          orders: [],
        };
      }

      userOrdersMap[userId].orders.push({
        orderId: order._id,
        createdAt: order.createdAt,
        status: order.status,
        totalAmount: order.totalAmount,
        address: order.address,
        products: order.products.map(p => ({
          productId: p.productId._id,
          title: p.productId.title,
          price: p.productId.price,
          units: p.productId.units,
          image: p.productId.image,
          quantity: p.quantity,
          subtotal: p.subtotal,
        })),
      });
    });

    const response = Object.values(userOrdersMap);

    res.status(200).json({
      message: "All orders grouped by user retrieved successfully",
      data: response,
    });
  } catch (err) {
    console.error("Error fetching grouped orders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
