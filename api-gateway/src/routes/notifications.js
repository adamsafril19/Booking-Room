const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { verifyToken } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();

// Notification service proxy configuration
const notificationProxy = createProxyMiddleware({
  target: process.env.NOTIFICATION_SERVICE_URL || "http://127.0.0.1:8005",
  changeOrigin: true,
  pathRewrite: {
    "^/api/v1/notifications": "/api", // Remove /api/v1/notifications prefix when forwarding
  },
  onError: (err, req, res) => {
    logger.error("Notification service proxy error:", err);
    res.status(503).json({
      error: "Service Unavailable",
      message: "Notification service is currently unavailable",
      code: "NOTIFICATION_SERVICE_UNAVAILABLE",
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    logger.debug(
      `Proxying notification request: ${req.method} ${req.originalUrl} -> ${proxyReq.path}`
    );
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.debug(
      `Notification service response: ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`
    );
  },
});

// Health check for notification service
router.get("/health", async (req, res) => {
  try {
    const response = await fetch(
      `${process.env.NOTIFICATION_SERVICE_URL}/health`
    );
    const data = await response.json();
    res.json({
      service: "notification-service",
      status: response.ok ? "healthy" : "unhealthy",
      response: data,
    });
  } catch (error) {
    logger.error("Notification service health check failed:", error);
    res.status(503).json({
      service: "notification-service",
      status: "unhealthy",
      error: error.message,
    });
  }
});

// Notification endpoints
/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: unread
 *         schema:
 *           type: boolean
 *         description: Filter unread notifications only
 *     responses:
 *       200:
 *         description: List of notifications retrieved successfully
 */
router.get("/", verifyToken, notificationProxy);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification retrieved successfully
 *       404:
 *         description: Notification not found
 */
router.get("/:id", verifyToken, notificationProxy);

/**
 * @swagger
 * /api/v1/notifications:
 *   post:
 *     summary: Send notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipient_id
 *               - title
 *               - message
 *             properties:
 *               recipient_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [email, sms, push, in_app]
 *               priority:
 *                 type: string
 *                 enum: [low, normal, high, urgent]
 *     responses:
 *       201:
 *         description: Notification sent successfully
 *       400:
 *         description: Validation error
 */
router.post("/", verifyToken, notificationProxy);

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.put("/:id/read", verifyToken, notificationProxy);

/**
 * @swagger
 * /api/v1/notifications/mark-all-read:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.put("/mark-all-read", verifyToken, notificationProxy);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 */
router.delete("/:id", verifyToken, notificationProxy);

/**
 * @swagger
 * /api/v1/notifications/broadcast:
 *   post:
 *     summary: Send broadcast notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [email, sms, push, in_app]
 *               target:
 *                 type: string
 *                 enum: [all, active_users, admin]
 *     responses:
 *       201:
 *         description: Broadcast notification sent successfully
 */
router.post("/broadcast", verifyToken, notificationProxy);

// Notification preferences
/**
 * @swagger
 * /api/v1/notifications/preferences:
 *   get:
 *     summary: Get notification preferences
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification preferences retrieved successfully
 */
router.get("/preferences", verifyToken, notificationProxy);

/**
 * @swagger
 * /api/v1/notifications/preferences:
 *   put:
 *     summary: Update notification preferences
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email_notifications:
 *                 type: boolean
 *               sms_notifications:
 *                 type: boolean
 *               push_notifications:
 *                 type: boolean
 *               booking_reminders:
 *                 type: boolean
 *               marketing_emails:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification preferences updated successfully
 */
router.put("/preferences", verifyToken, notificationProxy);

// Templates (admin only)
router.get("/templates", verifyToken, notificationProxy);
router.post("/templates", verifyToken, notificationProxy);
router.put("/templates/:id", verifyToken, notificationProxy);
router.delete("/templates/:id", verifyToken, notificationProxy);

// Notification history and analytics
router.get("/history", verifyToken, notificationProxy);
router.get("/analytics", verifyToken, notificationProxy);

module.exports = router;
