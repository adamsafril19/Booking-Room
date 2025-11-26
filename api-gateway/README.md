# API Gateway

API Gateway untuk arsitektur microservices Room Booking System.

## 🚀 Fitur

- **Single Entry Point**: Satu titik akses untuk semua microservices
- **Authentication & Authorization**: JWT-based authentication dengan role management
- **Rate Limiting**: Pembatasan request untuk mencegah abuse
- **Request/Response Logging**: Logging komprehensif untuk monitoring
- **Health Monitoring**: Health check untuk semua services
- **API Documentation**: Swagger UI untuk dokumentasi API
- **Error Handling**: Centralized error handling
- **CORS Support**: Cross-origin resource sharing
- **Security Headers**: Helmet.js untuk security headers
- **Compression**: Response compression untuk performa

## 🏗️ Arsitektur

```
Frontend (React) → API Gateway → Microservices
                      ↓
               ┌─────────────────┐
               │   API Gateway   │
               │   (Port 8000)   │
               └─────────────────┘
                      ↓
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Auth Service │ │ Room Service │ │Booking Service│
│ (Port 8001)  │ │ (Port 8002)  │ │ (Port 8004)  │
└──────────────┘ └──────────────┘ └──────────────┘
        ↓             ↓
┌──────────────┐ ┌──────────────┐
│Report Service│ │Notification  │
│ (Port 8003)  │ │Service(8005) │
└──────────────┘ └──────────────┘
```

## 📦 Instalasi

1. **Install dependencies**:

   ```bash
   cd api-gateway
   npm install
   ```

2. **Setup environment**:

   ```bash
   cp .env.example .env
   # Edit .env file dengan konfigurasi yang sesuai
   ```

3. **Start development server**:

   ```bash
   npm run dev
   ```

4. **Start production server**:
   ```bash
   npm start
   ```

## 🔧 Konfigurasi

### Environment Variables

| Variable                   | Description              | Default                 |
| -------------------------- | ------------------------ | ----------------------- |
| `PORT`                     | API Gateway port         | `8000`                  |
| `NODE_ENV`                 | Environment mode         | `development`           |
| `JWT_SECRET`               | JWT secret key           | -                       |
| `AUTH_SERVICE_URL`         | Auth service URL         | `http://localhost:8001` |
| `ROOM_SERVICE_URL`         | Room service URL         | `http://localhost:8002` |
| `BOOKING_SERVICE_URL`      | Booking service URL      | `http://localhost:8004` |
| `REPORTING_SERVICE_URL`    | Reporting service URL    | `http://localhost:8003` |
| `NOTIFICATION_SERVICE_URL` | Notification service URL | `http://localhost:8005` |

### Service URLs

Pastikan semua microservices berjalan pada port yang benar:

- **Auth Service**: `http://localhost:8001`
- **Room Service**: `http://localhost:8002`
- **Reporting Service**: `http://localhost:8003`
- **Booking Service**: `http://localhost:8004`
- **Notification Service**: `http://localhost:8005`

## 📚 API Documentation

Akses dokumentasi API di: `http://localhost:8000/api/docs`

### Endpoints Utama

#### Authentication

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - User logout

#### Rooms

- `GET /api/v1/rooms` - Get all rooms
- `GET /api/v1/rooms/:id` - Get room by ID
- `POST /api/v1/rooms` - Create room (Auth required)
- `PUT /api/v1/rooms/:id` - Update room (Auth required)
- `DELETE /api/v1/rooms/:id` - Delete room (Auth required)

#### Bookings

- `GET /api/v1/bookings` - Get user bookings (Auth required)
- `GET /api/v1/bookings/:id` - Get booking by ID (Auth required)
- `POST /api/v1/bookings` - Create booking (Auth required)
- `PUT /api/v1/bookings/:id` - Update booking (Auth required)
- `DELETE /api/v1/bookings/:id` - Cancel booking (Auth required)

#### Reports

- `GET /api/v1/reports/usage` - Room usage report (Auth required)
- `GET /api/v1/reports/bookings` - Booking statistics (Auth required)
- `GET /api/v1/reports/dashboard` - Dashboard data (Auth required)

#### Notifications

- `GET /api/v1/notifications` - Get notifications (Auth required)
- `POST /api/v1/notifications` - Send notification (Auth required)
- `PUT /api/v1/notifications/:id/read` - Mark as read (Auth required)

## 🔒 Security

### Authentication

API Gateway menggunakan JWT (JSON Web Token) untuk authentication:

```javascript
// Header format
Authorization: Bearer <jwt_token>
```

### Rate Limiting

Default rate limiting:

- **100 requests per 15 minutes** per IP address
- Dapat dikonfigurasi melalui environment variables

### CORS

Konfigurasi CORS untuk frontend:

```javascript
// Default allowed origins
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

## 📊 Monitoring

### Health Checks

- **General Health**: `GET /health`
- **Detailed Health**: `GET /health/detailed`
- **Service-specific**:
  - `GET /health/auth`
  - `GET /health/rooms`
  - `GET /health/bookings`
  - `GET /health/reports`
  - `GET /health/notifications`

### Logging

Log files tersimpan di direktori `logs/`:

- `combined.log` - All logs
- `error.log` - Error logs only
- `exceptions.log` - Uncaught exceptions

### Request Tracking

Setiap request memiliki unique ID untuk tracking:

```json
{
  "requestId": "uuid-v4",
  "method": "GET",
  "url": "/api/v1/rooms",
  "statusCode": 200,
  "duration": "45ms"
}
```

## 🔧 Development

### Project Structure

```
api-gateway/
├── src/
│   ├── config/
│   │   └── swagger.js          # API documentation config
│   ├── middleware/
│   │   ├── auth.js             # Authentication middleware
│   │   ├── errorHandler.js     # Error handling middleware
│   │   └── requestLogger.js    # Request logging middleware
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── rooms.js           # Room routes
│   │   ├── bookings.js        # Booking routes
│   │   ├── reports.js         # Report routes
│   │   ├── notifications.js   # Notification routes
│   │   └── health.js          # Health check routes
│   ├── utils/
│   │   └── logger.js          # Winston logger configuration
│   └── index.js               # Main application file
├── logs/                      # Log files
├── .env                       # Environment variables
├── .gitignore
├── package.json
└── README.md
```

### Scripts

```bash
# Development
npm run dev          # Start dengan nodemon

# Production
npm start            # Start production server

# Testing
npm test             # Run tests

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
```

## 🐳 Docker

Untuk menjalankan dengan Docker:

```dockerfile
# Dockerfile example
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8000

CMD ["npm", "start"]
```

## 🚀 Deployment

### Environment Setup

1. **Development**: Default configuration
2. **Staging**: Update service URLs untuk staging environment
3. **Production**:
   - Update `JWT_SECRET` dengan value yang aman
   - Update service URLs untuk production
   - Set `NODE_ENV=production`
   - Configure proper logging
   - Setup monitoring dan alerting

### Load Balancing

Untuk production, gunakan load balancer (nginx, HAProxy) di depan API Gateway:

```nginx
upstream api_gateway {
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}

server {
    listen 80;
    server_name api.roombooking.com;

    location / {
        proxy_pass http://api_gateway;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

Jika ada pertanyaan atau issue:

- Create GitHub issue
- Email: support@roombooking.com
- Documentation: `http://localhost:8000/api/docs`
