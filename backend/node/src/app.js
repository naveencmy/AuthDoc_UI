const express = require("express");
const cors = require("cors");
const verifyRoutes = require("./routes/verify.routes");

const app = express();

/**
 * ✅ CORS — REQUIRED for browser frontend
 * Allows frontend (localhost:8080) to call backend (localhost:3000)
 * Does NOT affect Postman, OCR, or internal services
 */
app.use(
  cors({
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());
app.use("/api", verifyRoutes);

module.exports = app;
