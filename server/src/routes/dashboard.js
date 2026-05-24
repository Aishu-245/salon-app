const express = require("express");
const { all, get } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/salon", requireAuth, requireRole(["admin"]), async (req, res, next) => {
  try {
    const now = new Date().toISOString();
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

    const upcoming = await get(
      `SELECT COUNT(*) as count
       FROM appointments
       WHERE start_time >= ? AND status IN ('Pending', 'Confirmed', 'In Progress')`,
      [now]
    );

    const utilization = await all(
      `SELECT stylists.id, stylists.name, COUNT(appointments.id) as appointment_count
       FROM stylists
       LEFT JOIN appointments
         ON appointments.stylist_id = stylists.id
         AND appointments.start_time BETWEEN ? AND ?
         AND appointments.status != 'Cancelled'
       GROUP BY stylists.id
       ORDER BY stylists.name`,
      [todayStart, todayEnd]
    );

    const revenue = await get(
      `SELECT COALESCE(SUM(salon_services.price), 0) as total
       FROM appointments
       JOIN salon_services ON salon_services.id = appointments.service_id
       WHERE appointments.status = 'Completed'
         AND appointments.start_time BETWEEN ? AND ?`,
      [monthStart, todayEnd]
    );

    const serviceRevenue = await all(
      `SELECT salon_services.name as service_name,
              COUNT(appointments.id) as count,
              COALESCE(SUM(salon_services.price), 0) as revenue
       FROM appointments
       JOIN salon_services ON salon_services.id = appointments.service_id
       WHERE appointments.status = 'Completed'
         AND appointments.start_time BETWEEN ? AND ?
       GROUP BY salon_services.id
       ORDER BY revenue DESC`,
      [monthStart, todayEnd]
    );

    res.json({
      upcomingAppointments: upcoming.count,
      stylistUtilization: utilization,
      revenueThisMonth: revenue.total,
      serviceRevenue,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
