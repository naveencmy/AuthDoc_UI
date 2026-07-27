const express = require("express");
const cors = require("cors");
const verifyRoutes = require("./routes/verify.routes");
const { requestLogger, errorLogger } = require("./middleware/logger.middleware");
const { securityHeaders } = require("./middleware/security.middleware");

const app = express();

// --- Security ---
app.use(securityHeaders);

// --- CORS ---
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:8080")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// --- Body parsing ---
app.use(express.json({ limit: "1mb" }));

// --- Logging ---
app.use(requestLogger);

// --- Health check ---
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.get("/readyz", (req, res) => {
  res.status(200).json({ status: "ready" });
});

// --- Routes ---
app.use("/api", verifyRoutes);

// --- Error handling ---
app.use(errorLogger);

module.exports = app;
