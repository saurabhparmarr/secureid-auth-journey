const express = require("express");

const {
  setupMfa,
  verifyMfa,
} = require("../controllers/mfaController");

const router = express.Router();

router.post("/setup", setupMfa);

router.post("/verify", verifyMfa);

module.exports = router;