const express = require("express");
const { registerUser } = require("../controllers/auth/registerController");
const { loginUser } = require("../controllers/auth/loginController");
const router = express.Router();

//POST calls
router.post("/register", registerUser);
router.post('/login', loginUser);
//GET calls

//PUT calls

//DEL calls

module.exports = router;
