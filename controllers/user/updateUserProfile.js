const User = require("..//..//models/User"); 

// Add a new address
exports.addAddress = async (req, res) => {
  const userId = req.user._id;
  const newAddress = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (newAddress.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push(newAddress);
    await user.save();

    res
      .status(200)
      .json({
        message: "Address added successfully",
        addresses: user.addresses,
      });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add address", error: err.message });
  }
};

exports.updateAddress = async (req, res) => {
  const userId = req.user._id;
  const { addressId } = req.params;
  const updatedAddress = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (updatedAddress.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex].toObject(),
      ...updatedAddress,
    };

    await user.save();

    res
      .status(200)
      .json({
        message: "Address updated successfully",
        addresses: user.addresses,
      });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update address", error: err.message });
  }
};
