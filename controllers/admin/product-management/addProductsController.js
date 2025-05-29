// controllers/productController.js
const Product = require("../../../models/Products");

const addProductsController = async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { title, category, price, image, stock } = req.body;

    if (!title || !category || !price) {
      return res
        .status(400)
        .json({ message: "Title, category, and price are required." });
    }

    const product = new Product({ title, category, price, image, stock });
    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("Add Product Error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { addProductsController };
