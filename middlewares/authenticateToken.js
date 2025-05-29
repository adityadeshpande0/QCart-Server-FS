const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access Denied, token is missing!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // << Add this for debugging

    req.user = {
      id: decoded.userId,
      isAdmin: decoded.isAdmin, // << Must be present
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(400).json({ error: "Invalid Token!" });
  }
};

module.exports = authenticateToken;
