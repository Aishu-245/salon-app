import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import AppointmentCard from "../components/AppointmentCard.jsx";
import Pagination from "../components/Pagination.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

const Appointments = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    stylistId: "",
    categoryId: "",
    phone: "",
    date: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async (pageValue = page) => {
    setError("");
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries({ ...filters, page: pageValue, pageSize }).filter(([, v]) => v !== ""))
      );
      const data = await api.listAppointments(params.toString());
      setItems(data.items);
      setTotal(data.total);
      setPage(pageValue);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
    api.getStylists().then(setStylists).catch(() => {});
  }, []);

  useEffect(() => {
    loadData(1);
  }, [filters]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.updateStatus(id, { status });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const canUpdateStatus = user?.role === "admin" || user?.role === "stylist";

  return (
    <div className="page">
      <h2>Appointment History</h2>
      {error && <p className="error">{error}</p>}
      <div className="filters">
        <label>
          Status
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All</option>
            {["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          Stylist
          <select value={filters.stylistId} onChange={(e) => setFilters({ ...filters, stylistId: e.target.value })}>
            <option value="">All</option>
            {stylists.map((stylist) => (
              <option key={stylist.id} value={stylist.id}>
                {stylist.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}>
            <option value="">All</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Customer Phone
          <input
            value={filters.phone}
            onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
            placeholder="Search phone"
          />
        </label>
        <label>
          Date
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          />
        </label>
      </div>
      {loading && <p className="loading-msg">Loading appointments...</p>}
      {!loading && items.length === 0 && (
        <p className="muted empty-state">No appointments found. Try adjusting your filters.</p>
      )}
      {!loading && (
        <div className="grid">
          {items.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onStatusChange={canUpdateStatus ? handleStatusChange : null}
            />
          ))}
        </div>
      )}
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={(value) => {
        setPage(value);
        loadData(value);
      }} />
    </div>
  );
};

export default Appointments;
