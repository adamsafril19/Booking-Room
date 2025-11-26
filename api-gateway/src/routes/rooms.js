const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { verifyToken } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();

// Room service proxy configuration
const roomProxy = createProxyMiddleware({
  target: process.env.ROOM_SERVICE_URL || "http://127.0.0.1:8002",
  changeOrigin: true,
  pathRewrite: {
    "^/api/v1/rooms": "/api", // Remove /api/v1/rooms prefix when forwarding
  },
  onError: (err, req, res) => {
    logger.error("Room service proxy error:", err);
    res.status(503).json({
      error: "Service Unavailable",
      message: "Room service is currently unavailable",
      code: "ROOM_SERVICE_UNAVAILABLE",
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    logger.debug(
      `Proxying room request: ${req.method} ${req.originalUrl} -> ${proxyReq.path}`
    );
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.debug(
      `Room service response: ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`
    );
  },
});

// Health check for room service
router.get("/health", async (req, res) => {
  try {
    const response = await fetch(`${process.env.ROOM_SERVICE_URL}/health`);
    const data = await response.json();
    res.json({
      service: "room-service",
      status: response.ok ? "healthy" : "unhealthy",
      response: data,
    });
  } catch (error) {
    logger.error("Room service health check failed:", error);
    res.status(503).json({
      service: "room-service",
      status: "unhealthy",
      error: error.message,
    });
  }
});

// Room endpoints
/**
 * @swagger
 * /api/v1/rooms:
 *   get:
 *     summary: Get all rooms
 *     tags: [Rooms]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: List of rooms retrieved successfully
 */
router.get("/", roomProxy);

/**
 * @swagger
 * /api/v1/rooms/{id}:
 *   get:
 *     summary: Get room by ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room retrieved successfully
 *       404:
 *         description: Room not found
 */
router.get("/:id", roomProxy);

/**
 * @swagger
 * /api/v1/rooms:
 *   post:
 *     summary: Create a new room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - capacity
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Room created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", verifyToken, roomProxy);

/**
 * @swagger
 * /api/v1/rooms/{id}:
 *   put:
 *     summary: Update room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room updated successfully
 *       404:
 *         description: Room not found
 */
router.put("/:id", verifyToken, roomProxy);

/**
 * @swagger
 * /api/v1/rooms/{id}:
 *   delete:
 *     summary: Delete room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *       404:
 *         description: Room not found
 */
router.delete("/:id", verifyToken, roomProxy);

/**
 * @swagger
 * /api/v1/rooms/{id}/availability:
 *   get:
 *     summary: Check room availability
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Room ID
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Availability status retrieved
 */
router.get("/:id/availability", roomProxy);

// Room search and filtering
router.get("/search", roomProxy);
router.get("/filter", roomProxy);

// Room images
router.post("/:id/images", verifyToken, roomProxy);
router.delete("/:id/images/:imageId", verifyToken, roomProxy);

module.exports = router;
