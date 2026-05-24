import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api.js";

const Appointment = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState(state?.service?.id || "");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [stylists, setStylists] = useState([]);
  const [stylistId, setStylistId] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    api
      .getServices("?active=1")
      .then(setServices)
      .catch((err) => setError(err.message));
  }, []);

  const loadAvailability = async () => {
    if (!serviceId || !date || !startTime) return;
    setError("");
    setCheckingAvailability(true);
    setStylistId("");
    try {
      const params = new URLSearchParams({ serviceId, date, startTime });
      const data = await api.getAvailability(params.toString());
      setStylists(data.stylists);
    } catch (err) {
      setError(err.message);
      setStylists([]);
    } finally {
      setCheckingAvailability(false);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, [serviceId, date, startTime]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const appointment = await api.createAppointment({
        serviceId: Number(serviceId),
        stylistId: Number(stylistId),
        date,
        startTime,
        notes,
      });
      navigate("/appointments/confirm", { state: { appointment } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>Reserve Appointment</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="form">
        <label>
          Service
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} required>
            <option value="">Select service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} ({service.duration_minutes} mins)
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label>
          Start Time
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </label>
        <label>
          Preferred Stylist
          {checkingAvailability && <span className="muted"> Checking availability...</span>}
          {!checkingAvailability && serviceId && date && startTime && stylists.length === 0 && (
            <span className="error"> No stylists available at this time. Try a different date or time.</span>
          )}
          <select value={stylistId} onChange={(e) => setStylistId(e.target.value)} required>
            <option value="">Select stylist</option>
            {stylists.map((stylist) => (
              <option key={stylist.id} value={stylist.id}>
                {stylist.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Special Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" />
        </label>
        <button className="primary" disabled={loading}>
          {loading ? "Booking..." : "Confirm Appointment"}
        </button>
      </form>
    </div>
  );
};

export default Appointment;
