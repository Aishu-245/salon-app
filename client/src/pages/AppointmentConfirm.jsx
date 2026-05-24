import React from "react";
import { useLocation, Link } from "react-router-dom";

const AppointmentConfirm = () => {
  const { state } = useLocation();
  const appointment = state?.appointment;

  if (!appointment) {
    return (
      <div className="page">
        <h2>No appointment found.</h2>
        <Link to="/appointments/new">Book an appointment</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <h2>Appointment Confirmed</h2>
        <p className="muted">Your booking is created and pending approval.</p>
        <p>
          <strong>Appointment ID:</strong> {appointment.id}
        </p>
        <p>
          <strong>Status:</strong> {appointment.status}
        </p>
        <p>
          <strong>Start:</strong> {new Date(appointment.start_time).toLocaleString()}
        </p>
        <p>
          <strong>End:</strong> {new Date(appointment.end_time).toLocaleString()}
        </p>
        <Link to="/appointments" className="primary-link">
          View Appointment History
        </Link>
      </div>
    </div>
  );
};

export default AppointmentConfirm;
