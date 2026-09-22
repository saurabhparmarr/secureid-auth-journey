const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;
connectDB();
// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);


app.use(express.json());
app.use("/api", authRoutes);

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