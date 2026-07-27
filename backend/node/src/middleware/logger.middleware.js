// Structured JSON logging middleware

const LOG_LEVELS = { DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40 };

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase() || "INFO"] || LOG_LEVELS.INFO;

function sanitize(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const safe = { ...obj };
  const SENSITIVE_KEYS = ["password", "token", "secret", "authorization", "cookie"];
  for (const key of Object.keys(safe)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      safe[key] = "[REDACTED]";
    }
  }
  return safe;
}

function formatLog(level, message, meta = {}) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitize(meta),
    pid: process.pid,
  });
}

function log(level, message, meta) {
  const lvl = LOG_LEVELS[level] || LOG_LEVELS.INFO;
  if (lvl < currentLevel) return;
  const line = formatLog(level, message, meta);
  if (lvl >= LOG_LEVELS.WARN) {
    process.stderr.write(line + "\n");
  } else {
    process.stdout.write(line + "\n");
  }
}

// Request logging middleware
function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? "ERROR" : res.statusCode >= 400 ? "WARN" : "INFO";

    log(level, "request_completed", {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration_ms: duration,
      ip: req.ip || req.connection?.remoteAddress,
      user_agent: req.get("user-agent"),
    });
  });

  log("INFO", "request_started", {
    method: req.method,
    url: req.originalUrl || req.url,
  });

  next();
}

// Error logging middleware
function errorLogger(err, req, res, next) {
  log("ERROR", "unhandled_error", {
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    method: req.method,
    url: req.originalUrl || req.url,
  });

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
}

module.exports = { log, requestLogger, errorLogger };
