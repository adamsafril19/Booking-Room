const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

/**
 * Middleware to verify JWT tokens
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Access denied",
        message: "No authorization header provided",
        code: "NO_AUTH_HEADER",
      });
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({
        error: "Access denied",
        message: "No token provided",
        code: "NO_TOKEN",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (jwtError) {
      logger.error("JWT verification failed:", jwtError.message);

      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Token expired",
          message: "Please login again",
          code: "TOKEN_EXPIRED",
        });
      }

      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          error: "Invalid token",
          message: "Token is malformed or invalid",
          code: "INVALID_TOKEN",
        });
      }

      return res.status(401).json({
        error: "Token verification failed",
        message: "Unable to verify token",
        code: "TOKEN_VERIFICATION_FAILED",
      });
    }
  } catch (error) {
    logger.error("Auth middleware error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Authentication verification failed",
      code: "AUTH_MIDDLEWARE_ERROR",
    });
  }
};

/**
 * Middleware to verify admin role
 */
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      error: "Access forbidden",
      message: "Admin role required",
      code: "ADMIN_REQUIRED",
    });
  }
};

/**
 * Optional auth middleware - doesn't fail if no token provided
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (jwtError) {
    logger.warn("Optional auth failed:", jwtError.message);
    req.user = null;
  }

  next();
};

module.exports = {
  verifyToken,
  verifyAdmin,
  optionalAuth,
};
