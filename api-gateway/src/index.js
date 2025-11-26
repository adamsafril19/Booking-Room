const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
require("dotenv").config();

const logger = require("./utils/logger");
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
const bookingRoutes = require("./routes/bookings");
const reportRoutes = require("./routes/reports");
const notificationRoutes = require("./routes/notifications");
const healthRoutes = require("./routes/health");
const swaggerSetup = require("./config/swagger");
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/requestLogger");

const app = express();
const PORT = process.env.PORT || 8000;

// Security middleware
if (process.env.HELMET_ENABLED === "true") {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    })
  );
}

// Compression middleware
if (process.env.COMPRESSION_ENABLED === "true") {
  app.use(compression());
}

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Request-Source",
      "X-API-Gateway",
      "Accept",
      "Origin",
      "Cache-Control",
      "Pragma",
    ],
    exposedHeaders: ["Content-Length", "X-Request-ID"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Body parsing middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
app.use(
  morgan(process.env.LOG_FORMAT || "combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Custom request logging
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

// API Documentation
if (process.env.API_DOCS_ENABLED === "true") {
  swaggerSetup(app);
}

// Health check endpoint
app.use("/health", healthRoutes);

// API routes with versioning
const apiRouter = express.Router();

// Mount service routes
apiRouter.use("/auth", authRoutes);
apiRouter.use("/rooms", roomRoutes);
apiRouter.use("/bookings", bookingRoutes);
apiRouter.use("/reports", reportRoutes);
apiRouter.use("/notifications", notificationRoutes);

// Mount API router with version prefix
app.use(`/api/${process.env.API_VERSION || "v1"}`, apiRouter);

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "Room Booking API Gateway",
    version: process.env.API_VERSION || "v1",
    status: "healthy",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      docs: process.env.API_DOCS_ENABLED === "true" ? "/api/docs" : "disabled",
      api: `/api/${process.env.API_VERSION || "v1"}`,
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: `The requested endpoint ${req.method} ${req.originalUrl} was not found.`,
    code: "ENDPOINT_NOT_FOUND",
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 API Gateway running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(
    `📖 API Documentation: ${
      process.env.API_DOCS_ENABLED === "true"
        ? `http://localhost:${PORT}/api/docs`
        : "Disabled"
    }`
  );
  logger.info(`💚 Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;
