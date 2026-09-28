const speakeasy = require("speakeasy");

const generateMfaSecret = ({ email }) => {
  const secret = speakeasy.generateSecret({
    name: `SecureID (${email})`,
    issuer: "SecureID",
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
  };
};

const verifyMfaCode = ({ secret, code }) => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: code,
    window: 1,
  });
};

module.exports = {
  generateMfaSecret,
  verifyMfaCode,
};