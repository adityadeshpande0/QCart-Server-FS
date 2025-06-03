const Order = require("../../../models/Orders");

exports.getAllActiveOrders = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const orders = await Order.find()
      .populate("userId", "name email isActive")
      .populate("products.productId", "title price units image")
      .sort({ createdAt: -1 });

    const userOrdersMap = {};

    orders.forEach((order) => {
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

      const validProducts = order.products.filter((p) => {
        if (!p.productId) {
          console.warn(`Missing productId in order ${order._id}`);
          return false;
        }
        return true;
      });

      userOrdersMap[userId].orders.push({
        orderId: order._id,
        createdAt: order.createdAt,
        status: order.status,
        totalAmount: order.totalAmount,
        address: order.address,
        products: validProducts.map((p) => ({
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


exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const validStatuses = ["Dispatched", "Delivered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status update." });
    }

    const updateFields = { status };
    if (status === "Dispatched") updateFields.dispatchedAt = new Date();
    if (status === "Delivered") updateFields.deliveredAt = new Date();

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateFields, {
      new: true,
    }).populate("userId", "email name"); // Optional: get userId/email for socket

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Emit socket event to the specific user
    const io = req.app.get("io");
    const userId = updatedOrder.userId._id.toString();

    io.to(userId).emit("order-status-updated", {
      orderId: updatedOrder._id,
      status: updatedOrder.status,
      dispatchedAt: updatedOrder.dispatchedAt,
      deliveredAt: updatedOrder.deliveredAt,
    });

    res.status(200).json({
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (err) {
    console.error("Failed to update order status:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

