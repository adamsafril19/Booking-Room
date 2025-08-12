# Room Booking System Frontend

A React + TypeScript frontend application for managing room bookings, built with Vite, Tailwind CSS, and React Router.

## Features

- **Authentication**: Login and registration with JWT tokens
- **Room Management**: Create, edit, and delete rooms with facilities
- **Booking Management**: Create and manage room bookings with conflict detection
- **Reports**: Generate PDF and XLSX usage reports
- **Responsive Design**: Modern UI built with Tailwind CSS

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   The API base URL is configured to point to your backend at `http://127.0.0.1:8000/api`.
   If you need to change this, update the `baseURL` in `src/api/api.ts`.

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── api/
│   └── api.ts              # Axios configuration with auth interceptors
├── components/
│   ├── Button.tsx          # Reusable button component
│   ├── Card.tsx            # Card wrapper component
│   └── Input.tsx           # Input wrapper component
├── context/
│   └── AuthContext.tsx     # Authentication context and provider
├── hooks/
│   └── useAuth.ts          # Custom auth hook
├── pages/
│   ├── Login.tsx           # Login page
│   ├── Register.tsx        # Registration page
│   ├── Dashboard.tsx       # Main dashboard
│   ├── Rooms.tsx           # Room listing and management
│   ├── RoomForm.tsx        # Room creation/editing form
│   ├── Bookings.tsx        # Booking listing and management
│   ├── BookingForm.tsx     # Booking creation/editing form
│   └── Reports.tsx         # Report generation page
├── App.tsx                 # Main app component
├── Pages.tsx               # Routing configuration
└── main.tsx               # Application entry point
```

## API Endpoints

The frontend expects the following API endpoints:

### Authentication
- `POST /login` - User login
- `POST /register` - User registration
- `GET /me` - Get current user info

### Rooms
- `GET /rooms` - List all rooms
- `POST /rooms` - Create new room
- `GET /rooms/:id` - Get room details
- `PUT /rooms/:id` - Update room
- `DELETE /rooms/:id` - Delete room

### Bookings
- `GET /bookings` - List all bookings
- `POST /bookings` - Create new booking
- `GET /bookings/:id` - Get booking details
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Delete booking

### Reports
- `GET /reports/usage` - Download usage report (PDF/XLSX)

## Example API Calls

### Register User
```bash
curl -X POST http://127.0.0.1:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Create Room
```bash
curl -X POST http://127.0.0.1:8000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Conference Room A","capacity":10,"facilities":["Projector","Whiteboard"],"status":"available"}'
```

### Create Booking
```bash
curl -X POST http://127.0.0.1:8000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"room_id":1,"start_time":"2024-01-15T09:00:00","end_time":"2024-01-15T11:00:00","purpose":"Team Meeting"}'
```

### Download Report
```bash
curl -X GET "http://127.0.0.1:8000/api/reports/usage?from=2024-01-01&to=2024-01-31&format=pdf" \
  -H "Authorization: Bearer <token>" \
  --output report.pdf
```

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management

## Development

The application uses:
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Context API** for authentication state
- **Axios** for API communication with automatic token injection

All components are built with TypeScript for better development experience and type safety.
