const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.registerUser = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const normalizedEmail = email.toLowerCase();

    const [existingUserEmail, existingUserPhone] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      User.findOne({ phone }),
    ]);

    if (existingUserPhone) {
      return res.status(400).json({ error: "Phone already registered" });
    }
    if (existingUserEmail) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email: normalizedEmail,
      isAdmin: normalizedEmail === process.env.ADMIN_EMAIL,
      phone,
      authentication: {
        password: hashPassword,
        salt,
      },
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        freeCashBalance: newUser.freeCashBalance,
        profilePicture: newUser.profilePicture,
        address: newUser.address,
      },
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
