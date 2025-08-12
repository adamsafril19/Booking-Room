import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { Box, Container, CssBaseline } from "@mui/material";
import NavigationDrawer from "./components/NavigationDrawer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import RoomForm from "./pages/RoomForm";
import Bookings from "./pages/Bookings";
import BookingForm from "./pages/BookingForm";
import Reports from "./pages/Reports";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const drawerWidth = 240;

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // if (import.meta.env.DEV) {
  //   return <>{children}</>;
  // }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CssBaseline />
        <Box sx={{ typography: "h6" }}>Memuat...</Box>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const Pages: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <BrowserRouter>
      <Box sx={{ display: "flex", minHeight: "100vh", width: "100vw" }}>
        <CssBaseline />
        <NavigationDrawer
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          drawerWidth={drawerWidth}
        />
        <Container
          component="main"
          maxWidth={false}
          disableGutters
          sx={{
            flexGrow: 1,
            mt: 0,
            px: 0, // hanya padding horizontal 24px
            pb: 0, // padding bottom 32px
          }}
        >
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms"
              element={
                <ProtectedRoute>
                  <Rooms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms/new"
              element={
                <ProtectedRoute>
                  <RoomForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms/:id/edit"
              element={
                <ProtectedRoute>
                  <RoomForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings/new"
              element={
                <ProtectedRoute>
                  <BookingForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings/:id/edit"
              element={
                <ProtectedRoute>
                  <BookingForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </Box>
    </BrowserRouter>
  );
};

export default Pages;
