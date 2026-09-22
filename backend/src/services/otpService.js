const crypto = require("crypto");

const OtpChallenge = require("../models/OtpChallenge");
const generateOtp = require("../utils/generateOtp");

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;

const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

const createOtpChallenge = async ({ userId, purpose, method }) => {
  const otp = generateOtp();

  const otpHash = hashOtp(otp);

  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
  );

  const challenge = await OtpChallenge.create({
    userId,
    purpose,
    method,
    otpHash,
    expiresAt,
    maxAttempts: MAX_OTP_ATTEMPTS,
  });

  // Development/testing only.
  // In production, this would be sent through an email/SMS provider.
  console.log(`[OTP] ${method} OTP for ${purpose}: ${otp}`);

  return challenge;
};

const verifyOtp = async ({ challengeId, otp }) => {
  const challenge = await OtpChallenge.findById(challengeId);

  if (!challenge) {
    return {
      success: false,
      reason: "CHALLENGE_NOT_FOUND",
    };
  }

  if (challenge.verified) {
    return {
      success: false,
      reason: "OTP_ALREADY_USED",
    };
  }

  if (new Date() > challenge.expiresAt) {
    return {
      success: false,
      reason: "OTP_EXPIRED",
    };
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    return {
      success: false,
      reason: "MAX_ATTEMPTS_EXCEEDED",
    };
  }

  const otpHash = hashOtp(otp);

  if (otpHash !== challenge.otpHash) {
    challenge.attempts += 1;
    await challenge.save();

    return {
      success: false,
      reason:
        challenge.attempts >= challenge.maxAttempts
          ? "MAX_ATTEMPTS_EXCEEDED"
          : "INVALID_OTP",
    };
  }

  challenge.verified = true;
  await challenge.save();

  return {
    success: true,
    challenge,
  };
};

module.exports = {
  createOtpChallenge,
  verifyOtp,
};