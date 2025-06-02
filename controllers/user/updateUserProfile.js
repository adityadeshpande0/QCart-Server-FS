const User = require("..//..//models/User");

// Add a new address
exports.addAddress = async (req, res) => {
  const userId = req.user.id;
  const newAddress = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (newAddress.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(200).json({
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to add address", error: err.message });
  }
};

// Update an address
exports.updateAddress = async (req, res) => {
  const userId = req.user.id;
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

    res.status(200).json({
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update address", error: err.message });
  }
};

exports.getAddresses = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Addresses retrieved successfully",
      addresses: user.addresses,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to get addresses", error: err.message });
  }
};

// Delete an address
exports.deleteAddress = async (req, res) => {
  const userId = req.user.id;
  const { addressId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const initialLength = user.addresses.length;
    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId
    );

    if (user.addresses.length === initialLength) {
      return res.status(404).json({ message: "Address not found" });
    }
    if (!user.addresses.some(addr => addr.isDefault) && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
    await user.save();
    res.status(200).json({
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete address", error: err.message });
  }
};