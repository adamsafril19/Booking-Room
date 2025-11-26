const express = require("express");
const axios = require("axios");
const logger = require("../utils/logger");

const router = express.Router();

// Booking service base URL
const BOOKING_SERVICE_URL =
  process.env.BOOKING_SERVICE_URL || "http://127.0.0.1:8004";

// Manual proxy function using axios
const proxyToBookingService = async (req, res) => {
  try {
    const targetPath = req.originalUrl.replace("/api/v1/bookings", "/api");
    const targetUrl = `${BOOKING_SERVICE_URL}${targetPath}`;

    logger.info(
      `[BOOKING PROXY] Forwarding ${req.method} ${req.originalUrl} -> ${targetUrl}`
    );
    logger.debug("Request headers:", req.headers);
    logger.debug("Request body:", req.body);

    // Prepare headers for the target service
    const headers = {
      "Content-Type": req.headers["content-type"] || "application/json",
      Accept: req.headers["accept"] || "application/json",
      "User-Agent": req.headers["user-agent"] || "API-Gateway",
    };

    // Forward authorization header if present (important for auth)
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    const axiosConfig = {
      method: req.method.toLowerCase(),
      url: targetUrl,
      headers: headers,
      timeout: 15000,
      validateStatus: () => true, // Don't throw on HTTP error status codes
    };

    // Add request body for POST/PUT/PATCH requests
    if (
      ["post", "put", "patch"].includes(req.method.toLowerCase()) &&
      req.body
    ) {
      axiosConfig.data = req.body;
    }

    // Add query parameters
    if (Object.keys(req.query).length > 0) {
      axiosConfig.params = req.query;
    }

    const response = await axios(axiosConfig);

    logger.info(
      `[BOOKING PROXY] Response ${response.status} for ${req.method} ${req.originalUrl}`
    );
    logger.debug("Response headers:", response.headers);

    // Forward response headers
    Object.keys(response.headers).forEach((key) => {
      if (
        !["content-encoding", "transfer-encoding", "connection"].includes(
          key.toLowerCase()
        )
      ) {
        res.setHeader(key, response.headers[key]);
      }
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    logger.error("Booking service proxy error:", error.message);
    logger.error("Error code:", error.code);
    logger.error("Error details:", error);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "Service Unavailable",
        message: "Booking service is not responding",
        code: "BOOKING_SERVICE_DOWN",
      });
    }

    if (error.code === "ETIMEDOUT") {
      return res.status(504).json({
        error: "Gateway Timeout",
        message: "Booking service request timed out",
        code: "BOOKING_SERVICE_TIMEOUT",
      });
    }

    res.status(502).json({
      error: "Bad Gateway",
      message: "Error communicating with booking service",
      code: "BOOKING_SERVICE_ERROR",
      details: error.message,
    });
  }
};

// Health check for booking service
router.get("/health", async (req, res) => {
  try {
    const response = await axios.get(`${BOOKING_SERVICE_URL}/health`, {
      timeout: 5000,
      validateStatus: () => true,
    });
    res.json({
      service: "booking-service",
      status: response.status === 200 ? "healthy" : "unhealthy",
      response: response.data,
    });
  } catch (error) {
    logger.error("Booking service health check failed:", error);
    res.status(503).json({
      service: "booking-service",
      status: "unhealthy",
      error: error.message,
    });
  }
});

// Booking endpoints
/**
 * @swagger
 * /api/v1/bookings:
 *   get:
 *     summary: Get user bookings
 *     tags: [Bookings]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *         description: Filter by booking status
 *     responses:
 *       200:
 *         description: List of bookings retrieved successfully
 */
router.get("/", proxyToBookingService);

/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *       404:
 *         description: Booking not found
 */
router.get("/:id", proxyToBookingService);

/**
 * @swagger
 * /api/v1/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room_id
 *               - start_date
 *               - end_date
 *               - start_time
 *               - end_time
 *             properties:
 *               room_id:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               start_time:
 *                 type: string
 *                 format: time
 *               end_time:
 *                 type: string
 *                 format: time
 *               purpose:
 *                 type: string
 *               attendees:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Room not available for selected time
 */
router.post("/", proxyToBookingService);

/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   put:
 *     summary: Update booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       404:
 *         description: Booking not found
 */
router.put("/:id", proxyToBookingService);

/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   delete:
 *     summary: Cancel booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       404:
 *         description: Booking not found
 */
router.delete("/:id", proxyToBookingService);

// Admin endpoints
router.get("/all", proxyToBookingService);
router.get("/statistics", proxyToBookingService);
router.put("/:id/status", proxyToBookingService);

module.exports = router;
