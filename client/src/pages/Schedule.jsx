import React, { useEffect, useState } from "react";
import { api } from "../api.js";

const Schedule = () => {
  const [date, setDate] = useState("");
  const [stylists, setStylists] = useState([]);
  const [stylistId, setStylistId] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getStylists("?active=1")
      .then((data) => {
        setStylists(data);
        if (data.length && !stylistId) {
          setStylistId(String(data[0].id));
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  const loadSchedule = async () => {
    if (!date || !stylistId) return;
    setError("");
    try {
      const rows = await api.getSchedule(stylistId, date);
      setAppointments(rows);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [date, stylistId]);

  return (
    <div className="page">
      <h2>Daily Stylist Schedule</h2>
      {error && <p className="error">{error}</p>}
      <div className="filters">
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label>
          Stylist
          <select value={stylistId} onChange={(e) => setStylistId(e.target.value)} required>
            {stylists.map((stylist) => (
              <option key={stylist.id} value={stylist.id}>
                {stylist.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid">
        {appointments.length === 0 && <p className="muted">No appointments for this day.</p>}
        {appointments.map((appt) => (
          <div key={appt.id} className="card">
            <h3>{appt.service_name}</h3>
            <p>
              <strong>Customer:</strong> {appt.customer_name}
            </p>
            <p>
              <strong>Time:</strong> {new Date(appt.start_time).toLocaleString()}
            </p>
            <p>
              <strong>Status:</strong> {appt.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
