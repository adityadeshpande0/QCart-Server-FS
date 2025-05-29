const fs = require("fs");
const ExcelJS = require("exceljs");
const Product = require("../../../models/Products");

const addProductsController = async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // 📥 Handle Excel File Upload
    if (req.file) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(req.file.path);
      const worksheet = workbook.worksheets[0];

      const productsToInsert = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const [title, category, price, image, stock] = row.values.slice(1); // skip index 0

        if (title && category && price) {
          productsToInsert.push({
            title,
            category,
            price: Number(price),
            image: image || "",
            stock: Number(stock || 0),
          });
        }
      });

      fs.unlinkSync(req.file.path); // Clean up temp file

      if (productsToInsert.length === 0) {
        return res.status(400).json({ message: "No valid products found in Excel file." });
      }

      const inserted = await Product.insertMany(productsToInsert);
      return res.status(201).json({ message: "Products added successfully.", products: inserted });
    }

    // 🧾 Handle JSON body (Single product)
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ message: "Invalid request body or missing data." });
    }

    const { title, category, price, image, stock } = req.body;

    if (!title || !category || !price) {
      return res.status(400).json({ message: "Title, category, and price are required." });
    }

    const product = new Product({ title, category, price, image, stock });
    const saved = await product.save();

    res.status(201).json(saved);
  } catch (err) {
    console.error("Add Product Error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { addProductsController };
