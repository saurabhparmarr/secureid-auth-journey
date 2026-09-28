const bcrypt = require("bcryptjs");

const OtpChallenge = require("../models/OtpChallenge");
const generateOtp = require("../utils/generateOtp");

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;
const inFlightChallenges = new Map();

const hashOtp = (otp) => bcrypt.hash(otp, 10);

const createOtpChallenge = async ({
  userId,
  purpose,
  method,
  forceNew = false,
}) => {
  const requestKey = `${userId}:${purpose}:${method}`;
  const pendingRequest = inFlightChallenges.get(requestKey);

  if (pendingRequest && (!forceNew || pendingRequest.forceNew)) {
    return pendingRequest.promise;
  }

  const createChallenge = async () => {
    if (!forceNew) {
      const existingChallenge = await OtpChallenge.findOne({
        userId,
        purpose,
        method,
        verified: false,
        invalidated: { $ne: true },
        expiresAt: { $gt: new Date() },
        $expr: { $lt: ["$attempts", "$maxAttempts"] },
      }).sort({ createdAt: -1 });

      if (existingChallenge) {
        return existingChallenge;
      }
    }

    if (forceNew) {
      await OtpChallenge.updateMany(
        { userId, purpose, method, verified: false, invalidated: { $ne: true } },
        { $set: { invalidated: true } }
      );
    }

    const otp = generateOtp();

    const otpHash = await hashOtp(otp);

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
      invalidated: false,
    });

    // Development/testing only.
    // In production, this would be sent through an email/SMS provider.
    console.log(
      `[SIMULATED ${method.toUpperCase()}]\nUser: ${userId}\nOTP: ${otp}`
    );

    return challenge;
  };

  const pendingChallenge = pendingRequest
    ? pendingRequest.promise.then(createChallenge)
    : createChallenge();
  const request = { promise: pendingChallenge, forceNew };
  inFlightChallenges.set(requestKey, request);

  try {
    return await pendingChallenge;
  } finally {
    if (inFlightChallenges.get(requestKey) === request) {
      inFlightChallenges.delete(requestKey);
    }
  }
};

const classifyChallengeFailure = (challenge) => {
  if (!challenge) return { success: false, reason: "CHALLENGE_NOT_FOUND" };
  if (challenge.verified) {
    return {
      success: false,
      reason: "OTP_ALREADY_USED",
      attemptsRemaining: 0,
    };
  }
  if (challenge.attempts >= challenge.maxAttempts) {
    return {
      success: false,
      reason: "MAX_ATTEMPTS_EXCEEDED",
      attemptsRemaining: 0,
    };
  }
  if (challenge.invalidated) {
    return {
      success: false,
      reason: "OTP_INVALIDATED",
      attemptsRemaining: 0,
    };
  }
  if (challenge.expiresAt <= new Date()) {
    return {
      success: false,
      reason: "OTP_EXPIRED",
      attemptsRemaining: 0,
    };
  }
  return null;
};

const verifyOtp = async ({ challengeId, otp, purpose, method }) => {
  const challenge = await OtpChallenge.findById(challengeId);

  const inactive = classifyChallengeFailure(challenge);
  if (inactive) return inactive;

  if (
    (purpose && challenge.purpose !== purpose) ||
    (method && challenge.method !== method)
  ) {
    return { success: false, reason: "CHALLENGE_NOT_FOUND" };
  }

  const matchesOtp = await bcrypt.compare(otp, challenge.otpHash);
  const now = new Date();

  if (matchesOtp) {
    const verifiedChallenge = await OtpChallenge.findOneAndUpdate(
      {
        _id: challengeId,
        purpose: challenge.purpose,
        method: challenge.method,
        otpHash: challenge.otpHash,
        verified: false,
        invalidated: { $ne: true },
        expiresAt: { $gt: now },
        $expr: { $lt: ["$attempts", "$maxAttempts"] },
      },
      { $set: { verified: true } },
      { new: true }
    );

    if (verifiedChallenge) {
      return { success: true, challenge: verifiedChallenge };
    }
  } else {
    const updatedChallenge = await OtpChallenge.findOneAndUpdate(
      {
        _id: challengeId,
        purpose: challenge.purpose,
        method: challenge.method,
        otpHash: challenge.otpHash,
        verified: false,
        invalidated: { $ne: true },
        expiresAt: { $gt: now },
        $expr: { $lt: ["$attempts", "$maxAttempts"] },
      },
      { $inc: { attempts: 1 } },
      { new: true }
    );

    if (updatedChallenge) {
      const attemptsRemaining = Math.max(
        updatedChallenge.maxAttempts - updatedChallenge.attempts,
        0
      );

      if (attemptsRemaining === 0) {
        await OtpChallenge.updateOne(
          { _id: updatedChallenge._id, attempts: { $gte: updatedChallenge.maxAttempts } },
          { $set: { invalidated: true } }
        );
      }

      return {
        success: false,
        reason:
          attemptsRemaining === 0
            ? "MAX_ATTEMPTS_EXCEEDED"
            : "INVALID_OTP",
        attemptsRemaining,
      };
    }
  }

  const currentChallenge = await OtpChallenge.findById(challengeId);
  return (
    classifyChallengeFailure(currentChallenge) || {
      success: false,
      reason: "CHALLENGE_NOT_FOUND",
    }
  );
};

module.exports = {
  createOtpChallenge,
  verifyOtp,
};