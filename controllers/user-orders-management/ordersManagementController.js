const Order = require("..//..//models/Orders");
const Product = require("..//../models/Products");
const User = require("..//../models/User");

exports.placeOrder = async (req, res) => {
  try {
    const { products, address } = req.body;
    const userId = req.user.id;
    const io = req.app.get("io");
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "No products provided" });
    }

    const productIds = products.map((p) => p.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    const orderItems = [];

    for (const item of products) {
      const dbProduct = dbProducts.find(
        (p) => p._id.toString() === item.productId
      );
      if (!dbProduct) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.productId}` });
      }

      if (item.quantity > dbProduct.stock) {
        return res.status(400).json({
          message: `Insufficient stock for product ${dbProduct.title}. Available: ${dbProduct.stock}`,
        });
      }

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: dbProduct.price,
        subtotal: dbProduct.price * item.quantity,
      });
    }

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    const order = new Order({
      userId,
      products: orderItems,
      address: {
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        zipCode: address.zipCode || "",
        country: address.country || "",
      },
      totalAmount,
    });

    await order.save();
    io.to("admins").emit("new-order", {
      order,
      message: "New order placed",
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error("Order placement error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ userId })
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

exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    if (order.status === "Delivered") {
      return res
        .status(400)
        .json({ message: "Delivered order cannot be cancelled" });
    }

    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    order.status = "Cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
