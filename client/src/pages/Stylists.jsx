import React, { useEffect, useState } from "react";
import { api } from "../api.js";

const days = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const buildDefaultHours = () =>
  days.map((day) => ({
    dayOfWeek: day.value,
    startTime: "10:00",
    endTime: "19:00",
    enabled: day.value !== 0,
  }));

const Stylists = () => {
  const [stylists, setStylists] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    isActive: true,
  });
  const [hours, setHours] = useState(buildDefaultHours());

  const loadStylists = async () => {
    try {
      setLoading(true);
      const data = await api.getStylists();
      setStylists(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStylists();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "", bio: "", isActive: true });
    setHours(buildDefaultHours());
  };

  const handleEdit = (stylist) => {
    setEditing(stylist);
    setForm({
      name: stylist.name,
      email: stylist.email || "",
      phone: stylist.phone || "",
      bio: stylist.bio || "",
      isActive: !!stylist.is_active,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const payload = {
      ...form,
      hours: hours
        .filter((h) => h.enabled)
        .map((h) => ({
          dayOfWeek: h.dayOfWeek,
          startTime: h.startTime,
          endTime: h.endTime,
        })),
    };
    try {
      if (editing) {
        await api.updateStylist(editing.id, payload);
      } else {
        await api.createStylist(payload);
      }
      resetForm();
      await loadStylists();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <h2>Stylist Management</h2>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="loading-msg">Loading stylists...</p>
      ) : stylists.length === 0 ? (
        <p className="muted empty-state">No stylists found. Add one below.</p>
      ) : (
        <div className="grid">
          {stylists.map((stylist) => (
            <div key={stylist.id} className="card">
              <h3>{stylist.name}</h3>
              <p className="muted">{stylist.email}</p>
              <p>{stylist.phone}</p>
              <p>{stylist.bio}</p>
              <p>
                <strong>Status:</strong> {stylist.is_active ? "Active" : "Inactive"}
              </p>
              <button className="secondary" onClick={() => handleEdit(stylist)}>
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="card form-section">
        <h3>{editing ? "Update Stylist" : "Add Stylist"}</h3>
        <form onSubmit={handleSubmit} className="form">
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            Email
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label>
            Bio
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows="2" />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>
          <div className="hours-grid">
            {hours.map((hour, idx) => (
              <div key={hour.dayOfWeek} className="hours-row">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={hour.enabled}
                    onChange={(e) => {
                      const next = [...hours];
                      next[idx] = { ...hour, enabled: e.target.checked };
                      setHours(next);
                    }}
                  />
                  {days.find((d) => d.value === hour.dayOfWeek)?.label}
                </label>
                <input
                  type="time"
                  value={hour.startTime}
                  onChange={(e) => {
                    const next = [...hours];
                    next[idx] = { ...hour, startTime: e.target.value };
                    setHours(next);
                  }}
                />
                <input
                  type="time"
                  value={hour.endTime}
                  onChange={(e) => {
                    const next = [...hours];
                    next[idx] = { ...hour, endTime: e.target.value };
                    setHours(next);
                  }}
                />
              </div>
            ))}
          </div>
          <div className="form-actions">
            <button className="primary">{editing ? "Update" : "Create"}</button>
            {editing && (
              <button type="button" className="ghost" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Stylists;
