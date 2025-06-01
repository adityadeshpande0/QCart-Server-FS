const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    // E.g., 'kg', 'liters', 'pcs'
    units: { type: String, required: true, enum: ['kg', 'liters', 'pcs', 'meters', 'packs'] },
    // Quantity per unit (optional, useful for bulk or sub-unit handling)
    unitValue: { type: Number, default: 1 }, // e.g., 1 kg, 1 liter, 1 piece
    // Stock will represent the total available in units
    stock: { type: Number, required: true, default: 0 }, // E.g., 50 kg or 100 pcs
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
