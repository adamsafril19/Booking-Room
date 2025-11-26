const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Room Booking API Gateway",
      version: "1.0.0",
      description: "API Gateway for Room Booking Microservices Architecture",
      contact: {
        name: "API Support",
        email: "support@roombooking.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8000}/api/${
          process.env.API_VERSION || "v1"
        }`,
        description: "Development server",
      },
      {
        url: `https://api.roombooking.com/api/${
          process.env.API_VERSION || "v1"
        }`,
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error title",
            },
            message: {
              type: "string",
              description: "Error message",
            },
            code: {
              type: "string",
              description: "Error code",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Error timestamp",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "User ID",
            },
            name: {
              type: "string",
              description: "User full name",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            role: {
              type: "string",
              enum: ["user", "admin"],
              description: "User role",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Room: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Room ID",
            },
            name: {
              type: "string",
              description: "Room name",
            },
            capacity: {
              type: "integer",
              description: "Room capacity",
            },
            location: {
              type: "string",
              description: "Room location",
            },
            description: {
              type: "string",
              description: "Room description",
            },
            amenities: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Room amenities",
            },
            status: {
              type: "string",
              enum: ["available", "maintenance", "unavailable"],
              description: "Room status",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Booking: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Booking ID",
            },
            user_id: {
              type: "integer",
              description: "User ID who made the booking",
            },
            room_id: {
              type: "integer",
              description: "Room ID being booked",
            },
            start_date: {
              type: "string",
              format: "date",
              description: "Booking start date",
            },
            end_date: {
              type: "string",
              format: "date",
              description: "Booking end date",
            },
            start_time: {
              type: "string",
              format: "time",
              description: "Booking start time",
            },
            end_time: {
              type: "string",
              format: "time",
              description: "Booking end time",
            },
            purpose: {
              type: "string",
              description: "Booking purpose",
            },
            attendees: {
              type: "integer",
              description: "Number of attendees",
            },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "cancelled", "completed"],
              description: "Booking status",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Notification: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Notification ID",
            },
            user_id: {
              type: "integer",
              description: "Recipient user ID",
            },
            title: {
              type: "string",
              description: "Notification title",
            },
            message: {
              type: "string",
              description: "Notification message",
            },
            type: {
              type: "string",
              enum: ["email", "sms", "push", "in_app"],
              description: "Notification type",
            },
            priority: {
              type: "string",
              enum: ["low", "normal", "high", "urgent"],
              description: "Notification priority",
            },
            read_at: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "When notification was read",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Authentication information is missing or invalid",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        ForbiddenError: {
          description: "Insufficient permissions",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        ValidationError: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        ServiceUnavailableError: {
          description: "Service temporarily unavailable",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "User authentication and authorization",
      },
      {
        name: "Rooms",
        description: "Room management operations",
      },
      {
        name: "Bookings",
        description: "Booking management operations",
      },
      {
        name: "Reports",
        description: "Reporting and analytics",
      },
      {
        name: "Notifications",
        description: "Notification management",
      },
    ],
  },
  apis: [
    "./src/routes/*.js", // Path to the API files
    "./src/index.js",
  ],
};

const specs = swaggerJsdoc(options);

const swaggerSetup = (app) => {
  // Swagger UI options
  const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
      docExpansion: "none",
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
      requestInterceptor: (req) => {
        req.headers["X-API-Gateway"] = "true";
        return req;
      },
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0 }
      .swagger-ui .info .title { color: #3b82f6 }
    `,
    customSiteTitle: "Room Booking API Documentation",
    customfavIcon: "/favicon.ico",
  };

  // Serve Swagger documentation
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

  // Serve OpenAPI spec as JSON
  app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });

  console.log(
    `📖 API Documentation available at: http://localhost:${
      process.env.PORT || 8000
    }/api/docs`
  );
};

module.exports = swaggerSetup;
