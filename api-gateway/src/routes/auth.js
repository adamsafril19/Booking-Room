const express = require("express");
const axios = require("axios");
const logger = require("../utils/logger");

const router = express.Router();

// Auth service base URL
const AUTH_SERVICE_URL = "http://127.0.0.1:8001";

// Manual proxy function using axios
const proxyToAuthService = async (req, res) => {
  try {
    const targetPath = req.originalUrl.replace('/api/v1/auth', '/api');
    const targetUrl = `${AUTH_SERVICE_URL}${targetPath}`;
    
    logger.info(`[AUTH PROXY] Forwarding ${req.method} ${req.originalUrl} -> ${targetUrl}`);
    logger.debug("Request headers:", req.headers);
    logger.debug("Request body:", req.body);

    // Prepare headers for the target service
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Accept': req.headers['accept'] || 'application/json',
      'User-Agent': req.headers['user-agent'] || 'API-Gateway',
    };

    // Add authorization header if present
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
    if (['post', 'put', 'patch'].includes(req.method.toLowerCase()) && req.body) {
      axiosConfig.data = req.body;
    }

    // Add query parameters
    if (Object.keys(req.query).length > 0) {
      axiosConfig.params = req.query;
    }

    const response = await axios(axiosConfig);
    
    logger.info(`[AUTH PROXY] Response ${response.status} for ${req.method} ${req.originalUrl}`);
    logger.debug("Response headers:", response.headers);
    
    // Forward response headers
    Object.keys(response.headers).forEach(key => {
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, response.headers[key]);
      }
    });

    res.status(response.status).json(response.data);
    
  } catch (error) {
    logger.error("Auth service proxy error:", error.message);
    logger.error("Error code:", error.code);
    logger.error("Error details:", error);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: "Service Unavailable",
        message: "Authentication service is not responding",
        code: "AUTH_SERVICE_DOWN",
      });
    }

    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        error: "Gateway Timeout",
        message: "Authentication service request timed out",
        code: "AUTH_SERVICE_TIMEOUT",
      });
    }

    res.status(502).json({
      error: "Bad Gateway",
      message: "Error communicating with authentication service",
      code: "AUTH_SERVICE_ERROR",
      details: error.message,
    });
  }
};

// Health check for auth service
router.get("/health", async (req, res) => {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/health`, {
      timeout: 5000,
      validateStatus: () => true,
    });
    res.json({
      service: "auth-service",
      status: response.status === 200 ? "healthy" : "unhealthy",
      response: response.data,
    });
  } catch (error) {
    logger.error("Auth service health check failed:", error);
    res.status(503).json({
      service: "auth-service",
      status: "unhealthy",
      error: error.message,
    });
  }
});

// Auth endpoints
/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", proxyToAuthService);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: User registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Validation error
 */
router.post("/register", proxyToAuthService);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", proxyToAuthService);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post("/refresh", proxyToAuthService);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 */
router.get("/me", proxyToAuthService);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put("/profile", proxyToAuthService);

// Password reset endpoints
router.post("/forgot-password", proxyToAuthService);
router.post("/reset-password", proxyToAuthService);
router.post("/change-password", proxyToAuthService);

// Admin endpoints
router.get("/users", proxyToAuthService);
router.get("/users/:id", proxyToAuthService);
router.put("/users/:id", proxyToAuthService);
router.delete("/users/:id", proxyToAuthService);

module.exports = router;
