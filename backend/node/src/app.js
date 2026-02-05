const express = require("express");
const cors = require("cors");
const verifyRoutes = require("./routes/verify.routes");

const app = express();
app.use(
  cors({
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());
app.use("/api", verifyRoutes);

module.exports = app;
