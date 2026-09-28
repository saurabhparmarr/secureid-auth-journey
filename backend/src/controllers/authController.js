const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { createOtpChallenge, verifyOtp } = require("../services/otpService");

const User = require("../models/User");
const OtpChallenge = require("../models/OtpChallenge");


const registerUser = async (req, res) => {
  let createdUser;

  try {
    const { fullName, email, countryCode, mobile, password, terms } = req.body;
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedName =
      typeof fullName === "string" ? fullName.trim() : "";
    const normalizedMobile =
      typeof mobile === "string" ? mobile.trim() : "";
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    const validMobile = /^\d{10}$/.test(normalizedMobile);
    const validCountryCode = ["+1", "+44", "+91"].includes(countryCode);

    if (!normalizedName || !validEmail || !validMobile || !password) {
      return res.status(400).json({
        success: false,
        message: !normalizedName
          ? "Full name is required."
          : !validEmail
            ? "Please enter a valid email address."
            : !validMobile || !validCountryCode
              ? "Please enter a valid mobile number."
              : "Password is required.",
      });
    }

    if (terms !== true) {
      return res.status(400).json({
        success: false,
        message: "Please accept the Terms & Conditions and Privacy Policy.",
      });
    }

    const existingEmail = await User.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const existingMobile = await User.findOne({
      mobile: normalizedMobile,
    });

    if (existingMobile) {
      return res.status(409).json({
        success: false,
        message: "An account with this mobile number already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    createdUser = await User.create({
      fullName: normalizedName,
      email: normalizedEmail,
      countryCode,
      mobile: normalizedMobile,
      password: passwordHash,
    });

    const challenge = await createOtpChallenge({
      userId: createdUser._id,
      purpose: "email_verification",
      method: "email",
    });

    return res.status(201).json({
      success: true,
      message: "Registration started. Email verification is required.",
      userId: createdUser._id,
      challengeId: challenge._id,
      challengeExpiresAt: challenge.expiresAt,
      nextStep: "email_verification",
    });
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      return res.status(409).json({
        success: false,
        message:
          duplicateField === "mobile"
            ? "An account with this mobile number already exists."
            : "An account with this email already exists.",
      });
    }

    if (createdUser) {
      try {
        await User.deleteOne({ _id: createdUser._id });
      } catch (cleanupError) {
        console.error("Failed to clean up incomplete registration:", cleanupError);
      }
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during registration.",
    });
  }
};

const getRegistrationStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = await User.findById(userId).select(
      "_id emailVerified mobileVerified mfaEnabled mfaVerified mfaSecret"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const purpose = user.emailVerified
      ? "sms_verification"
      : "email_verification";
    const method = user.emailVerified ? "sms" : "email";
    const latestChallenge = await OtpChallenge.findOne({
      userId: user._id,
      purpose,
      method,
    }).sort({ createdAt: -1 });
    const activeChallenge =
      latestChallenge &&
      !latestChallenge.verified &&
      !latestChallenge.invalidated &&
      latestChallenge.expiresAt > new Date() &&
      latestChallenge.attempts < latestChallenge.maxAttempts
        ? latestChallenge
        : null;
    const challengeStatus = !latestChallenge
      ? "missing"
      : latestChallenge.attempts >= latestChallenge.maxAttempts
        ? "attempts_exhausted"
        : latestChallenge.invalidated
          ? "invalidated"
          : latestChallenge.verified
            ? "used"
            : latestChallenge.expiresAt <= new Date()
              ? "expired"
              : "active";

    let nextStep = "emailOtp";

    if (user.emailVerified && !user.mobileVerified) {
      nextStep = "mobileOtp";
    } else if (user.emailVerified && user.mobileVerified) {
      nextStep =
        user.mfaEnabled && user.mfaVerified
          ? "success"
          : "mfaSetup";
    }

    return res.status(200).json({
      success: true,
      userId: user._id,
      emailVerified: user.emailVerified,
      mobileVerified: user.mobileVerified,
      mfaEnabled: user.mfaEnabled,
      mfaVerified: user.mfaVerified,
      challengeId: activeChallenge?._id || null,
      challengeExpiresAt: activeChallenge?.expiresAt || null,
      challengeStatus,
      mfaSetupInitialized: Boolean(user.mfaSecret),
      nextStep,
    });
  } catch (error) {
    console.error("Registration status error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while loading registration status.",
    });
  }
};

const verifyEmailOtp = async (req, res) => {
  try {
    const { challengeId, otp } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(challengeId) ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        success: false,
        reason: "INVALID_OTP_INPUT",
        message: "A valid challenge ID and 6-digit OTP are required.",
      });
    }

    const result = await verifyOtp({
      challengeId,
      otp,
      purpose: "email_verification",
      method: "email",
    });

    if (!result.success) {
      const statusMap = {
        CHALLENGE_NOT_FOUND: 404,
        OTP_ALREADY_USED: 400,
        OTP_EXPIRED: 400,
        MAX_ATTEMPTS_EXCEEDED: 429,
        OTP_INVALIDATED: 400,
        INVALID_OTP: 400,
      };

      return res.status(statusMap[result.reason] || 400).json({
        success: false,
        reason: result.reason,
        message: getOtpErrorMessage(result),
        attemptsRemaining: result.attemptsRemaining,
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
const sendEmailOtp = async (req, res) => {
  try {
    const { userId, resend = false } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified.",
      });
    }

    const challenge = await createOtpChallenge({
      userId: user._id,
      purpose: "email_verification",
      method: "email",
      forceNew: resend === true,
    });

    return res.status(200).json({
      success: true,
      message: "A new email OTP has been generated.",
      challengeId: challenge._id,
      challengeExpiresAt: challenge.expiresAt,
      nextStep: "email_verification",
    });
  } catch (error) {
    console.error("Email OTP resend error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending the email OTP.",
    });
  }
};
const getOtpErrorMessage = ({ reason, attemptsRemaining }) => {
  if (reason === "INVALID_OTP") {
    return `Invalid OTP. You have ${attemptsRemaining} attempts remaining.`;
  }

  const messages = {
    CHALLENGE_NOT_FOUND:
      "OTP challenge not found. Please request a new OTP.",
    OTP_ALREADY_USED: "This OTP has already been used.",
    OTP_EXPIRED: "OTP has expired. Please request a new OTP.",
    OTP_INVALIDATED: "This OTP is no longer valid. Please request a new OTP.",
    MAX_ATTEMPTS_EXCEEDED:
      "Maximum OTP attempts reached. Please request a new OTP.",
  };

  return messages[reason] || "OTP verification failed.";
};
const sendSmsOtp = async (req, res) => {
  try {
    const { userId, resend = false } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email first.",
      });
    }

    if (user.mobileVerified) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is already verified.",
      });
    }

    const challenge = await createOtpChallenge({
      userId: user._id,
      purpose: "sms_verification",
      method: "sms",
      forceNew: resend === true,
    });

    return res.status(200).json({
      success: true,
      message: "SMS OTP generated successfully.",
      challengeId: challenge._id,
      challengeExpiresAt: challenge.expiresAt,
      nextStep: "sms_verification",
    });
  } catch (error) {
    console.error("SMS OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while generating the SMS OTP.",
    });
  }
};
const verifySmsOtp = async (req, res) => {
  try {
    const { challengeId, otp } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(challengeId) ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        success: false,
        reason: "INVALID_OTP_INPUT",
        message: "A valid challenge ID and 6-digit OTP are required.",
      });
    }

    const result = await verifyOtp({
      challengeId,
      otp,
      purpose: "sms_verification",
      method: "sms",
    });

    if (!result.success) {
      const statusMap = {
        CHALLENGE_NOT_FOUND: 404,
        OTP_ALREADY_USED: 400,
        OTP_EXPIRED: 400,
        MAX_ATTEMPTS_EXCEEDED: 429,
        OTP_INVALIDATED: 400,
        INVALID_OTP: 400,
      };

      return res.status(statusMap[result.reason] || 400).json({
        success: false,
        reason: result.reason,
        message: getOtpErrorMessage(result),
        attemptsRemaining: result.attemptsRemaining,
      });
    }

    const user = await User.findById(result.challenge.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.mobileVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Mobile number verified successfully.",
      nextStep: "mfa_setup",
      userId: user._id,
    });
  } catch (error) {
    console.error("SMS OTP verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifying the SMS OTP.",
    });
  }
};
module.exports = {
  registerUser,
  getRegistrationStatus,
  sendEmailOtp,
  verifyEmailOtp,
  sendSmsOtp,
  verifySmsOtp,
};