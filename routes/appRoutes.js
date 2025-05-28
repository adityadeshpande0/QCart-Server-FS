const express = require("express");
const { registerUser } = require("../controllers/auth/registerController");
const { loginUser } = require("../controllers/auth/loginController");
const getProfileDetails = require("../controllers/get-profile-details/getProfileDetails");
const authenticateToken = require("../middlewares/authenticateToken");
const router = express.Router();

//POST calls
router.post("/register", registerUser);
router.post("/login", loginUser);
//GET calls
router.get("/user-profile", authenticateToken, getProfileDetails);
//PUT calls

//DEL calls

module.exports = router;
