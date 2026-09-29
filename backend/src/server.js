const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const mfaRoutes = require("./routes/mfaRoutes");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;
const frontendOrigin =
  process.env.FRONTEND_URL?.trim() ||
  (process.env.NODE_ENV === "production" ? null : "http://localhost:5173");

if (!frontendOrigin) {
  throw new Error("FRONTEND_URL must be configured in production.");
}

connectDB();
// Middleware
app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  })
);


app.use(express.json());
app.use("/api", authRoutes);
app.use("/api/mfa", mfaRoutes);

// Test route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SecureID backend is running",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});