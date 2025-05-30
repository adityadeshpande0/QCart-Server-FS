const Product = require("../../../models/Products");

const getAllProducts = async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Server error while retrieving products." });
  }
};

module.exports = getAllProducts;
