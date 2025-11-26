const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();

// Reporting service proxy configuration
const reportProxy = createProxyMiddleware({
  target: process.env.REPORTING_SERVICE_URL || "http://127.0.0.1:8003",
  changeOrigin: true,
  pathRewrite: {
    "^/api/v1/reports": "/api", // Remove /api/v1/reports prefix when forwarding
  },
  onError: (err, req, res) => {
    logger.error("Reporting service proxy error:", err);
    res.status(503).json({
      error: "Service Unavailable",
      message: "Reporting service is currently unavailable",
      code: "REPORTING_SERVICE_UNAVAILABLE",
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    logger.debug(
      `Proxying report request: ${req.method} ${req.originalUrl} -> ${proxyReq.path}`
    );
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.debug(
      `Reporting service response: ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`
    );
  },
});

// Health check for reporting service
router.get("/health", async (req, res) => {
  try {
    const response = await fetch(`${process.env.REPORTING_SERVICE_URL}/health`);
    const data = await response.json();
    res.json({
      service: "reporting-service",
      status: response.ok ? "healthy" : "unhealthy",
      response: data,
    });
  } catch (error) {
    logger.error("Reporting service health check failed:", error);
    res.status(503).json({
      service: "reporting-service",
      status: "unhealthy",
      error: error.message,
    });
  }
});

// Reporting endpoints
/**
 * @swagger
 * /api/v1/reports/usage:
 *   get:
 *     summary: Get room usage report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the report
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the report
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, pdf, csv]
 *           default: json
 *         description: Report format
 *     responses:
 *       200:
 *         description: Usage report generated successfully
 *       400:
 *         description: Invalid date range
 */
router.get("/usage", verifyToken, reportProxy);

/**
 * @swagger
 * /api/v1/reports/bookings:
 *   get:
 *     summary: Get booking statistics report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, pdf, csv]
 *           default: json
 *     responses:
 *       200:
 *         description: Booking report generated successfully
 */
router.get("/bookings", verifyToken, reportProxy);

/**
 * @swagger
 * /api/v1/reports/rooms:
 *   get:
 *     summary: Get room utilization report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, pdf, csv]
 *           default: json
 *     responses:
 *       200:
 *         description: Room utilization report generated successfully
 */
router.get("/rooms", verifyToken, reportProxy);

/**
 * @swagger
 * /api/v1/reports/users:
 *   get:
 *     summary: Get user activity report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, pdf, csv]
 *           default: json
 *     responses:
 *       200:
 *         description: User activity report generated successfully
 */
router.get("/users", verifyToken, reportProxy);

/**
 * @swagger
 * /api/v1/reports/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 */
router.get("/dashboard", verifyToken, reportProxy);

/**
 * @swagger
 * /api/v1/reports/analytics:
 *   get:
 *     summary: Get analytics data
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           enum: [bookings, users, rooms, revenue]
 *         description: Analytics metric type
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: Time period for analytics
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 */
router.get("/analytics", verifyToken, reportProxy);

// Admin-only reports
/**
 * @swagger
 * /api/v1/reports/admin/summary:
 *   get:
 *     summary: Get admin summary report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin summary report generated successfully
 *       403:
 *         description: Admin access required
 */
router.get("/admin/summary", verifyToken, verifyAdmin, reportProxy);

/**
 * @swagger
 * /api/v1/reports/admin/revenue:
 *   get:
 *     summary: Get revenue report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue report generated successfully
 *       403:
 *         description: Admin access required
 */
router.get("/admin/revenue", verifyToken, verifyAdmin, reportProxy);

// Export endpoints
router.get("/export/usage", verifyToken, reportProxy);
router.get("/export/bookings", verifyToken, reportProxy);
router.get("/export/rooms", verifyToken, reportProxy);

// Custom report generation
router.post("/custom", verifyToken, reportProxy);
router.get("/custom/:id", verifyToken, reportProxy);
router.delete("/custom/:id", verifyToken, reportProxy);

module.exports = router;
