const logger = require("../utils/logger");
const crypto = require("crypto");

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  // Generate unique request ID
  req.id = crypto.randomUUID();

  // Log request start
  const startTime = Date.now();

  logger.info("Request started", {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    contentType: req.get("Content-Type"),
    contentLength: req.get("Content-Length"),
    timestamp: new Date().toISOString(),
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = Date.now() - startTime;

    logger.info("Request completed", {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: res.get("Content-Length") || (chunk ? chunk.length : 0),
      timestamp: new Date().toISOString(),
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = requestLogger;
