const mongoose = require("mongoose");

const otpChallengeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    purpose: {
      type: String,
      enum: ["email_verification", "sms_verification", "login"],
      required: true,
    },

    method: {
      type: String,
      enum: ["email", "sms"],
      required: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    maxAttempts: {
      type: Number,
      default: 5,
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const OtpChallenge = mongoose.model(
  "OtpChallenge",
  otpChallengeSchema
);

module.exports = OtpChallenge;