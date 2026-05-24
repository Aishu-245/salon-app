import React from "react";

const AppointmentCard = ({ appointment, onStatusChange }) => {
  return (
    <div className="card">
      <h3>{appointment.service_name}</h3>
      <p className="muted">{appointment.category_name}</p>
      <p>
        <strong>Stylist:</strong> {appointment.stylist_name}
      </p>
      <p>
        <strong>Customer:</strong> {appointment.customer_name} ({appointment.customer_phone})
      </p>
      <p>
        <strong>Time:</strong> {new Date(appointment.start_time).toLocaleString()}
      </p>
      <p>
        <strong>Status:</strong> {appointment.status}
      </p>
      {onStatusChange && (
        <div className="status-actions">
          {["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"].map((status) => (
            <button
              key={status}
              className={status === appointment.status ? "secondary" : "ghost"}
              onClick={() => onStatusChange(appointment.id, status)}
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
