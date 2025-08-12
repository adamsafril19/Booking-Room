# Booking Service API Documentation

## Overview
This is a Laravel 10 microservice for managing room bookings. All endpoints require JWT authentication via the `auth.jwt` middleware.

## Base URL
```
http://localhost:8000/api
```

## Authentication
All requests must include a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Bookings
**GET** `/api/bookings`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "room_id": 3,
        "user_id": 5,
        "start_time": "2025-07-10T09:00:00Z",
        "end_time": "2025-07-10T10:00:00Z",
        "status": "confirmed",
        "created_at": "2025-01-06T23:12:00.000000Z",
        "updated_at": "2025-01-06T23:12:00.000000Z"
    },
    {
        "id": 2,
        "room_id": 1,
        "user_id": 3,
        "start_time": "2025-07-11T14:00:00Z",
        "end_time": "2025-07-11T16:00:00Z",
        "status": "pending",
        "created_at": "2025-01-06T22:30:00.000000Z",
        "updated_at": "2025-01-06T22:30:00.000000Z"
    }
]
```

### 2. Get Single Booking
**GET** `/api/bookings/{id}`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
    "id": 1,
    "room_id": 3,
    "user_id": 5,
    "start_time": "2025-07-10T09:00:00Z",
    "end_time": "2025-07-10T10:00:00Z",
    "status": "confirmed",
    "created_at": "2025-01-06T23:12:00.000000Z",
    "updated_at": "2025-01-06T23:12:00.000000Z"
}
```

### 3. Create Booking
**POST** `/api/bookings`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
    "room_id": 3,
    "user_id": 5,
    "start_time": "2025-07-10T09:00:00Z",
    "end_time": "2025-07-10T10:00:00Z"
}
```

**Response (201 Created):**
```json
{
    "id": 3,
    "room_id": 3,
    "user_id": 5,
    "start_time": "2025-07-10T09:00:00Z",
    "end_time": "2025-07-10T10:00:00Z",
    "status": "pending",
    "created_at": "2025-01-06T23:15:00.000000Z",
    "updated_at": "2025-01-06T23:15:00.000000Z"
}
```

**Response (422 Unprocessable Entity) - Time Conflict:**
```json
{
    "message": "Time slot is already booked."
}
```

**Response (422 Unprocessable Entity) - Validation Error:**
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "room_id": ["The room id field is required."],
        "start_time": ["The start time field is required."],
        "end_time": ["The end time must be a date after start time."]
    }
}
```

### 4. Update Booking
**PUT** `/api/bookings/{id}`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
    "start_time": "2025-07-10T10:00:00Z",
    "end_time": "2025-07-10T11:00:00Z",
    "status": "confirmed"
}
```

**Response (200 OK):**
```json
{
    "id": 1,
    "room_id": 3,
    "user_id": 5,
    "start_time": "2025-07-10T10:00:00Z",
    "end_time": "2025-07-10T11:00:00Z",
    "status": "confirmed",
    "created_at": "2025-01-06T23:12:00.000000Z",
    "updated_at": "2025-01-06T23:20:00.000000Z"
}
```

### 5. Delete Booking
**DELETE** `/api/bookings/{id}`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (204 No Content):**
```
(empty response body)
```

## Error Responses

### 401 Unauthorized
```json
{
    "message": "Unauthenticated."
}
```

### 404 Not Found
```json
{
    "message": "No query results for model [App\\Models\\Booking] {id}"
}
```

### 422 Unprocessable Entity
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "field_name": ["Error message"]
    }
}
```

## Environment Variables

Add the following to your `.env` file:

```env
AUTH_SERVICE_URL=http://auth-service
```

## Testing with cURL

### Get all bookings:
```bash
curl -X GET "http://localhost:8000/api/bookings" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json"
```

### Create a booking:
```bash
curl -X POST "http://localhost:8000/api/bookings" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": 3,
    "user_id": 5,
    "start_time": "2025-07-10T09:00:00Z",
    "end_time": "2025-07-10T10:00:00Z"
  }'
```

### Update a booking:
```bash
curl -X PUT "http://localhost:8000/api/bookings/1" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'
```

### Delete a booking:
```bash
curl -X DELETE "http://localhost:8000/api/bookings/1" \
  -H "Authorization: Bearer your-jwt-token"
```

## JWT Middleware

The `AuthJwtMiddleware` validates JWT tokens by making a request to the auth service:

1. Extracts the Bearer token from the request
2. Makes a GET request to `{AUTH_SERVICE_URL}/api/me` with the token
3. If successful, stores the user data in `$request->attributes->get('auth_user')`
4. If the auth service returns an error, returns 401 Unauthorized

## Conflict Detection

The booking service includes conflict detection to prevent double-booking:

- When creating a new booking, it checks if the time slot is already occupied
- When updating a booking, it checks for conflicts with other bookings (excluding itself)
- Returns 422 status with conflict message if a conflict is detected

## Validation Rules

### Store Booking Request:
- `room_id`: required, integer, must exist in rooms table
- `user_id`: required, integer, must exist in users table  
- `start_time`: required, date, must be before end_time
- `end_time`: required, date, must be after start_time

### Update Booking Request:
- `start_time`: sometimes required, date, must be before end_time
- `end_time`: sometimes required, date, must be after start_time
- `status`: sometimes required, must be one of: pending, confirmed, canceled 