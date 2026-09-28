const express = require("express");
const {
  registerUser,
  getRegistrationStatus,
  sendEmailOtp,
  verifyEmailOtp,
  sendSmsOtp,
  verifySmsOtp,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);

router.get("/registration-status/:userId", getRegistrationStatus);

router.post("/send-email-otp", sendEmailOtp);

router.post("/verify-email-otp", verifyEmailOtp);

router.post("/send-sms-otp", sendSmsOtp);

router.post("/verify-sms-otp", verifySmsOtp);

module.exports = router;