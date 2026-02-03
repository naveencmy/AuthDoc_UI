const express = require("express");
const verifyRoutes = require("./routes/verify.routes");

const app = express();
app.use(express.json());

app.use("/api", verifyRoutes);

module.exports = app;
