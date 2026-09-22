const express = require("express");

const { registerUser, verifyEmailOtp, } = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email-otp", verifyEmailOtp);
module.exports = router;