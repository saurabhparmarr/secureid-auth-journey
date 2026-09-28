const speakeasy = require("speakeasy");
const User = require("../models/User");

const setupMfa = async (req, res) => {
  try {
    const { userId } = req.body;

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

    if (!user.emailVerified || !user.mobileVerified) {
      return res.status(400).json({
        success: false,
        message: "Please complete email and mobile verification first.",
      });
    }

    const label = `SecureID:${user.email}`;
    let secret = user.mfaSecret;

    if (!secret) {
      secret = speakeasy.generateSecret({
        name: label,
        issuer: "SecureID",
      }).base32;

      user.mfaSecret = secret;
      await user.save();
    }

    const otpauthUrl = speakeasy.otpauthURL({
      secret,
      encoding: "base32",
      label,
      issuer: "SecureID",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
    });

    return res.status(200).json({
      success: true,
      message: "MFA setup initialized.",
      otpauthUrl,
      nextStep: "mfa_verification",
    });
  } catch (error) {
    console.error("MFA setup error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while setting up MFA.",
    });
  }
};

const verifyMfa = async (req, res) => {
  try {
    const { userId, token } = req.body;
    const normalizedToken =
      typeof token === "string" ? token.trim().replace(/\D/g, "") : "";

    if (!userId || normalizedToken.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "User ID and a valid 6-digit MFA code are required.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.mfaSecret) {
      return res.status(400).json({
        success: false,
        message: "MFA setup has not been initialized.",
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token: normalizedToken,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: "Invalid MFA code.",
      });
    }

    user.mfaVerified = true;
    user.mfaEnabled = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "MFA enabled successfully.",
      nextStep: "registration_success",
    });
  } catch (error) {
    console.error("MFA verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifying MFA.",
    });
  }
};

module.exports = {
  setupMfa,
  verifyMfa,
};