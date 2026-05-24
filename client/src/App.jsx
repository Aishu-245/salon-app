import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Services from "./pages/Services.jsx";
import Appointment from "./pages/Appointment.jsx";
import AppointmentConfirm from "./pages/AppointmentConfirm.jsx";
import Stylists from "./pages/Stylists.jsx";
import Schedule from "./pages/Schedule.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Appointments from "./pages/Appointments.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/services" replace />} />
              <Route path="/services" element={<Services />} />
              <Route
                path="/appointments/new"
                element={
                  <ProtectedRoute roles={["customer", "admin"]}>
                    <Appointment />
                  </ProtectedRoute>
                }
              />
              <Route path="/appointments/confirm" element={<AppointmentConfirm />} />
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute roles={["admin", "stylist", "customer"]}>
                    <Appointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stylists"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <Stylists />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/schedule"
                element={
                  <ProtectedRoute roles={["admin", "stylist"]}>
                    <Schedule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
};

export default App;
