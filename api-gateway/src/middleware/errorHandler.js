const logger = require("../utils/logger");

/**
 * Global error handler middleware
 */
const errorHandler = (error, req, res, next) => {
  logger.error("API Gateway Error:", {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });

  // Default error response
  let statusCode = 500;
  let errorResponse = {
    error: "Internal Server Error",
    message: "Something went wrong on our end. Please try again later.",
    code: "INTERNAL_SERVER_ERROR",
    timestamp: new Date().toISOString(),
    requestId: req.id || "unknown",
  };

  // Handle specific error types
  if (error.name === "ValidationError") {
    statusCode = 400;
    errorResponse = {
      error: "Validation Error",
      message: error.message,
      code: "VALIDATION_ERROR",
      details: error.details || [],
      timestamp: new Date().toISOString(),
    };
  } else if (error.name === "UnauthorizedError") {
    statusCode = 401;
    errorResponse = {
      error: "Unauthorized",
      message: "Authentication required",
      code: "UNAUTHORIZED",
      timestamp: new Date().toISOString(),
    };
  } else if (error.name === "ForbiddenError") {
    statusCode = 403;
    errorResponse = {
      error: "Forbidden",
      message: "Insufficient permissions",
      code: "FORBIDDEN",
      timestamp: new Date().toISOString(),
    };
  } else if (error.name === "NotFoundError") {
    statusCode = 404;
    errorResponse = {
      error: "Not Found",
      message: error.message || "Resource not found",
      code: "NOT_FOUND",
      timestamp: new Date().toISOString(),
    };
  } else if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
    statusCode = 503;
    errorResponse = {
      error: "Service Unavailable",
      message: "Unable to connect to backend service",
      code: "SERVICE_UNAVAILABLE",
      timestamp: new Date().toISOString(),
    };
  } else if (error.name === "TimeoutError") {
    statusCode = 504;
    errorResponse = {
      error: "Gateway Timeout",
      message: "Backend service took too long to respond",
      code: "GATEWAY_TIMEOUT",
      timestamp: new Date().toISOString(),
    };
  }

  // In development, include stack trace
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = error.stack;
    errorResponse.details = error.details || {};
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
