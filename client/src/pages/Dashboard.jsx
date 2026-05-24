import React, { useEffect, useState } from "react";
import { api } from "../api.js";

const RevenueChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="muted empty-state">No completed appointments this month.</p>;
  }
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="chart">
      {data.map((row) => (
        <div key={row.service_name} className="chart-row">
          <span className="chart-label">{row.service_name}</span>
          <div className="chart-bar-wrap">
            <div
              className="chart-bar"
              style={{ width: `${(row.revenue / max) * 100}%` }}
            />
            <span className="chart-value">${row.revenue.toFixed(2)} ({row.count})</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getDashboard()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!data) {
    return <p className="loading-msg">Loading dashboard...</p>;
  }

  return (
    <div className="page">
      <h2>Salon Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{data.upcomingAppointments}</h3>
          <p>Upcoming Appointments</p>
        </div>
        <div className="stat-card">
          <h3>${Number(data.revenueThisMonth).toFixed(2)}</h3>
          <p>Revenue This Month</p>
        </div>
        <div className="stat-card">
          <h3>{data.stylistUtilization.length}</h3>
          <p>Active Stylists</p>
        </div>
      </div>

      <div className="card">
        <h3>Revenue by Service (This Month)</h3>
        <RevenueChart data={data.serviceRevenue} />
      </div>

      <div className="card">
        <h3>Stylist Utilization (Today)</h3>
        {data.stylistUtilization.length === 0 ? (
          <p className="muted">No stylist data available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Stylist</th>
                <th>Appointments Today</th>
              </tr>
            </thead>
            <tbody>
              {data.stylistUtilization.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.appointment_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
