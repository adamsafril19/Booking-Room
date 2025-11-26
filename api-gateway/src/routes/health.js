const express = require("express");
const logger = require("../utils/logger");

const router = express.Router();

// Health check endpoint for API Gateway itself
router.get("/", async (req, res) => {
  const healthData = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    services: {},
  };

  // Check health of all microservices
  const services = [
    { name: "auth-service", url: process.env.AUTH_SERVICE_URL },
    { name: "room-service", url: process.env.ROOM_SERVICE_URL },
    { name: "booking-service", url: process.env.BOOKING_SERVICE_URL },
    { name: "reporting-service", url: process.env.REPORTING_SERVICE_URL },
    { name: "notification-service", url: process.env.NOTIFICATION_SERVICE_URL },
  ];

  // Check each service health in parallel
  const healthChecks = services.map(async (service) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${service.url}/health`, {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      clearTimeout(timeoutId);

      return {
        name: service.name,
        status: response.ok ? "healthy" : "unhealthy",
        responseTime: Date.now(),
        statusCode: response.status,
        url: service.url,
      };
    } catch (error) {
      logger.error(`Health check failed for ${service.name}:`, error.message);
      return {
        name: service.name,
        status: "unhealthy",
        error: error.message,
        url: service.url,
      };
    }
  });

  try {
    const results = await Promise.allSettled(healthChecks);

    results.forEach((result, index) => {
      const serviceName = services[index].name;
      if (result.status === "fulfilled") {
        healthData.services[serviceName] = result.value;
      } else {
        healthData.services[serviceName] = {
          name: serviceName,
          status: "unhealthy",
          error: result.reason?.message || "Unknown error",
          url: services[index].url,
        };
      }
    });

    // Determine overall health status
    const unhealthyServices = Object.values(healthData.services).filter(
      (service) => service.status !== "healthy"
    );

    if (unhealthyServices.length > 0) {
      healthData.status = "degraded";
      healthData.issues = unhealthyServices.map((service) => ({
        service: service.name,
        issue: service.error || "Service unhealthy",
      }));
    }

    // Set appropriate HTTP status code
    const statusCode =
      healthData.status === "healthy"
        ? 200
        : healthData.status === "degraded"
        ? 207
        : 503;

    res.status(statusCode).json(healthData);
  } catch (error) {
    logger.error("Health check error:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
      message: error.message,
    });
  }
});

// Detailed health check with more information
router.get("/detailed", async (req, res) => {
  const detailedHealth = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    platform: process.platform,
    nodeVersion: process.version,
    services: {},
    configuration: {
      port: process.env.PORT || 8000,
      apiVersion: process.env.API_VERSION || "v1",
      corsOrigin: process.env.CORS_ORIGIN || "*",
      rateLimitEnabled: !!process.env.RATE_LIMIT_MAX_REQUESTS,
      docsEnabled: process.env.API_DOCS_ENABLED === "true",
      logLevel: process.env.LOG_LEVEL || "info",
    },
  };

  try {
    // Check database connections if any
    // Check Redis connections if any
    // Check external service dependencies

    res.json(detailedHealth);
  } catch (error) {
    logger.error("Detailed health check error:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Detailed health check failed",
      message: error.message,
    });
  }
});

// Readiness probe (for Kubernetes)
router.get("/ready", (req, res) => {
  // Check if the service is ready to accept traffic
  // This could include checking database connections, etc.
  res.status(200).json({
    status: "ready",
    timestamp: new Date().toISOString(),
  });
});

// Liveness probe (for Kubernetes)
router.get("/live", (req, res) => {
  // Simple liveness check
  res.status(200).json({
    status: "alive",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Service-specific health checks
router.get("/auth", async (req, res) => {
  try {
    const response = await fetch(`${process.env.AUTH_SERVICE_URL}/health`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(503).json({
      service: "auth-service",
      status: "unhealthy",
      error: error.message,
    });
  }
});

router.get("/rooms", async (req, res) => {
  try {
    const response = await fetch(`${process.env.ROOM_SERVICE_URL}/health`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(503).json({
      service: "room-service",
      status: "unhealthy",
      error: error.message,
    });
  }
});

router.get("/bookings", async (req, res) => {
  try {
    const response = await fetch(`${process.env.BOOKING_SERVICE_URL}/health`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(503).json({
      service: "booking-service",
      status: "unhealthy",
      error: error.message,
    });
  }
});

router.get("/reports", async (req, res) => {
  try {
    const response = await fetch(`${process.env.REPORTING_SERVICE_URL}/health`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(503).json({
      service: "reporting-service",
      status: "unhealthy",
      error: error.message,
    });
  }
});

router.get("/notifications", async (req, res) => {
  try {
    const response = await fetch(
      `${process.env.NOTIFICATION_SERVICE_URL}/health`
    );
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(503).json({
      service: "notification-service",
      status: "unhealthy",
      error: error.message,
    });
  }
});

module.exports = router;
