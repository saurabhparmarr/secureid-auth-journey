const bcrypt = require("bcryptjs");
const { createOtpChallenge, verifyOtp } = require("../services/otpService");

const User = require("../models/User");


const registerUser = async (req, res) => {
  try {
    const { fullName, email, countryCode, mobile, password, terms } = req.body;

    // 1. Validate required fields
    if (!fullName || !email || !countryCode || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "All registration fields are required.",
      });
    }

    // 2. Terms must be accepted
    if (!terms) {
      return res.status(400).json({
        success: false,
        message: "Please accept the Terms & Conditions and Privacy Policy.",
      });
    }

    // 3. Check whether email already exists
    const existingEmail = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // 4. Check whether mobile already exists
    const existingMobile = await User.findOne({
      mobile,
    });

    if (existingMobile) {
      return res.status(409).json({
        success: false,
        message: "An account with this mobile number already exists.",
      });
    }

    // 5. Hash password before storing it
    const passwordHash = await bcrypt.hash(password, 12);

    // 6. Create user
    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      countryCode,
      mobile: mobile.trim(),
      password: passwordHash,
    });

    // 7. Generate first OTP for email verification
    const challenge = await createOtpChallenge({
      userId: user._id,
      purpose: "email_verification",
      method: "email",
    });

    // 8. Don't send password or OTP to frontend
    return res.status(201).json({
      success: true,
      message: "Registration started. Email verification is required.",
      challengeId: challenge._id,
      nextStep: "email_verification",
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during registration.",
    });
  }
};

const verifyEmailOtp = async (req, res) => {
  try {
    const { challengeId, otp } = req.body;

    if (!challengeId || !otp) {
      return res.status(400).json({
        success: false,
        message: "Challenge ID and OTP are required.",
      });
    }

    const result = await verifyOtp({
      challengeId,
      otp,
    });

    if (!result.success) {
      const statusMap = {
        CHALLENGE_NOT_FOUND: 404,
        OTP_ALREADY_USED: 400,
        OTP_EXPIRED: 400,
        MAX_ATTEMPTS_EXCEEDED: 429,
        INVALID_OTP: 400,
      };

      return res.status(statusMap[result.reason] || 400).json({
        success: false,
        reason: result.reason,
        message: getOtpErrorMessage(result.reason),
      });
    }

    const user = await User.findById(result.challenge.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.emailVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      nextStep: "sms_verification",
      userId: user._id,
    });
  } catch (error) {
    console.error("Email OTP verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifying the email OTP.",
    });
  }
};

const getOtpErrorMessage = (reason) => {
  const messages = {
    CHALLENGE_NOT_FOUND: "OTP challenge not found.",
    OTP_ALREADY_USED: "This OTP has already been used.",
    OTP_EXPIRED: "This OTP has expired. Please request a new OTP.",
    MAX_ATTEMPTS_EXCEEDED:
      "Maximum OTP attempts exceeded. Please request a new OTP.",
    INVALID_OTP: "The OTP you entered is incorrect. Please try again.",
  };

  return messages[reason] || "OTP verification failed.";
};
module.exports = {
  registerUser,
  verifyEmailOtp,
};
