import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Beauty Salon</h1>
          <p className="subtitle">Appointment & Stylist Management</p>
        </div>
        {user && (
          <div className="user-chip">
            <span>{user.name}</span>
            <span className="role">{user.role}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>
      <nav className="nav">
        <Link to="/services">Services</Link>
        <Link to="/appointments/new">Book Appointment</Link>
        <Link to="/appointments">Appointment History</Link>
        <Link to="/schedule">Daily Schedule</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/stylists">Stylist Management</Link>
      </nav>
      <main className="content">{children}</main>
    </div>
  );
};

export default Layout;
