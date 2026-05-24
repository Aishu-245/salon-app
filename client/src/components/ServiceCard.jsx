import React from "react";

const ServiceCard = ({ service, onSelect }) => {
  return (
    <div className="card">
      <h3>{service.name}</h3>
      <p className="muted">{service.category_name}</p>
      <p>
        <strong>Price:</strong> ${service.price}
      </p>
      <p>
        <strong>Duration:</strong> {service.duration_minutes} mins
      </p>
      {onSelect && (
        <button className="primary" onClick={() => onSelect(service)}>
          Book This
        </button>
      )}
    </div>
  );
};

export default ServiceCard;
