const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const request = async (path, options = {}) => {
  const token = localStorage.getItem("salon_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Request failed.");
  }
  return res.json();
};

export const api = {
  login: (payload) => request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  getServices: (params = "") => request(`/api/services${params}`),
  getCategories: () => request("/api/services/categories"),
  createService: (payload) => request("/api/services", { method: "POST", body: JSON.stringify(payload) }),
  getStylists: (params = "") => request(`/api/stylists${params}`),
  createStylist: (payload) => request("/api/stylists", { method: "POST", body: JSON.stringify(payload) }),
  updateStylist: (id, payload) => request(`/api/stylists/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  getAvailability: (params) => request(`/api/stylists/availability?${params}`),
  createAppointment: (payload) =>
    request("/api/appointments", { method: "POST", body: JSON.stringify(payload) }),
  listAppointments: (params) => request(`/api/appointments?${params}`),
  updateStatus: (id, payload) =>
    request(`/api/appointments/${id}/status`, { method: "PUT", body: JSON.stringify(payload) }),
  getDashboard: () => request("/api/dashboard/salon"),
  getSchedule: (id, date) => request(`/api/stylists/${id}/schedule?date=${date}`),
};
