const express = require("express");
const request = require("supertest");
const app = require("../src/index");

describe("API Gateway", () => {
  describe("GET /", () => {
    it("should return welcome message", async () => {
      const res = await request(app).get("/").expect(200);

      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe("Room Booking API Gateway");
    });
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      const res = await request(app).get("/health").expect(200);

      expect(res.body).toHaveProperty("status");
      expect(res.body).toHaveProperty("timestamp");
      expect(res.body).toHaveProperty("uptime");
    });
  });

  describe("GET /api/v1/auth/health", () => {
    it("should return auth service health", async () => {
      const res = await request(app).get("/api/v1/auth/health");

      expect(res.status).toBeOneOf([200, 503]);
      expect(res.body).toHaveProperty("service");
    });
  });

  describe("404 handler", () => {
    it("should return 404 for unknown endpoints", async () => {
      const res = await request(app).get("/unknown-endpoint").expect(404);

      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Endpoint not found");
    });
  });
});

// Custom Jest matchers
expect.extend({
  toBeOneOf(received, validOptions) {
    const pass = validOptions.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${validOptions}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${validOptions}`,
        pass: false,
      };
    }
  },
});
