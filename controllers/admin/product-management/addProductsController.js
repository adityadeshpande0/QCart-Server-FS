const fs = require("fs");
const ExcelJS = require("exceljs");
const Product = require("../../../models/Products");
const { productCategories } = require("../constants/productCategories");

const validCategories = productCategories.map((c) => c.value);
const validUnits = ["kg", "liters", "pcs", "meters", "packs"];

const addProductsController = async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    if (req.file) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(req.file.path);
      const worksheet = workbook.worksheets[0];

      const productsToInsert = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        const [title, category, price, image, units, stock, unitValue] = row.values.slice(1);

        if (
          title &&
          category &&
          price &&
          units &&
          validCategories.includes(category) &&
          validUnits.includes(units)
        ) {
          productsToInsert.push({
            title,
            category,
            price: Number(price),
            image: image || "",
            units,
            unitValue: unitValue ? Number(unitValue) : 1,
            stock: Number(stock || 0),
          });
        }
      });

      fs.unlinkSync(req.file.path);

      if (productsToInsert.length === 0) {
        return res
          .status(400)
          .json({ message: "No valid products found or invalid categories/units." });
      }

      const inserted = await Product.insertMany(productsToInsert);
      return res
        .status(201)
        .json({ message: "Products added successfully.", products: inserted });
    }

    const { title, category, price, image, stock, units, unitValue } = req.body;

    if (!title || !category || !price || !units) {
      return res.status(400).json({
        message: "Title, category, price, and units are required.",
      });
    }

    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: `Invalid category: ${category}` });
    }

    if (!validUnits.includes(units)) {
      return res.status(400).json({ message: `Invalid units: ${units}` });
    }

    const product = new Product({
      title,
      category,
      price,
      image,
      stock: Number(stock || 0),
      units,
      unitValue: unitValue ? Number(unitValue) : 1,
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Add Product Error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { addProductsController };
