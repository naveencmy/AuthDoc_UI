require("dotenv").config();

const app = require("./app");
const { log } = require("./middleware/logger.middleware");

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  log("INFO", "server_started", {
    port: PORT,
    env: process.env.NODE_ENV || "development",
    pid: process.pid,
  });
});

// Graceful shutdown
function shutdown(signal) {
  log("INFO", "server_shutting_down", { signal });
  server.close(() => {
    log("INFO", "server_closed");
    process.exit(0);
  });

  // Force shutdown after 10s
  setTimeout(() => {
    log("ERROR", "server_forced_shutdown");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  log("ERROR", "unhandled_rejection", {
    reason: reason?.message || String(reason),
  });
});

process.on("uncaughtException", (err) => {
  log("ERROR", "uncaught_exception", {
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});
