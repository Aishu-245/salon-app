import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth/AuthContext.jsx";
import ServiceCard from "../components/ServiceCard.jsx";

const Services = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    price: "",
    durationMinutes: "",
    isActive: true,
  });

  const loadData = async (catId = filterCategory) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ active: "1" });
      if (catId) params.set("categoryId", catId);
      const [serviceRows, categoryRows] = await Promise.all([
        api.getServices(`?${params.toString()}`),
        api.getCategories(),
      ]);
      setServices(serviceRows);
      setCategories(categoryRows);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCategoryFilter = (e) => {
    const catId = e.target.value;
    setFilterCategory(catId);
    loadData(catId);
  };

  const handleSelect = (service) => {
    navigate("/appointments/new", { state: { service } });
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await api.createService({
        name: form.name,
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        durationMinutes: Number(form.durationMinutes),
        isActive: form.isActive,
      });
      setForm({ name: "", categoryId: "", price: "", durationMinutes: "", isActive: true });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p className="loading-msg">Loading services...</p>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Available Services</h2>
        <p className="muted">Browse salon services and book your appointment.</p>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="filters">
        <label>
          Filter by Service Type
          <select value={filterCategory} onChange={handleCategoryFilter}>
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {services.length === 0 ? (
        <p className="muted empty-state">No services found for the selected category.</p>
      ) : (
        <div className="grid">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} onSelect={handleSelect} />
          ))}
        </div>
      )}

      {user?.role === "admin" && (
        <div className="card form-section">
          <h3>Create Service</h3>
          <form onSubmit={handleCreate} className="form">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              Category
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Price
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </label>
            <label>
              Duration (minutes)
              <input
                type="number"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                required
              />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active
            </label>
            <button className="primary">Create Service</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Services;
