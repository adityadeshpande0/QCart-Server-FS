const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false, unique: true },
    freeCashBalance: { type: Number, default: 0 },
    profilePicture: { type: String, required: false },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    address: {
      street: { type: String, required: false },
      city: { type: String, required: false },
      state: { type: String, required: false },
      zipCode: { type: String, required: false },
      country: { type: String, required: false },
      coordinates: {
        latitude: { type: Number, required: false },
        longitude: { type: Number, required: false },
      },
    },
    authentication: {
      password: { type: String, required: true },
      salt: { type: String, required: true },
      resetToken: { type: String },
      resetTokenExpiration: { type: Date },
      lastLogin: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
