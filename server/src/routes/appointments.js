const express = require("express");
const { all, get, run } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const toIso = (date, time) => new Date(`${date}T${time}:00`).toISOString();

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { serviceId, stylistId, date, startTime, notes } = req.body;
    if (!serviceId || !stylistId || !date || !startTime) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const service = await get("SELECT * FROM salon_services WHERE id = ? AND is_active = 1", [serviceId]);
    if (!service) {
      return res.status(400).json({ error: "Service not available." });
    }

    const stylist = await get("SELECT * FROM stylists WHERE id = ? AND is_active = 1", [stylistId]);
    if (!stylist) {
      return res.status(400).json({ error: "Stylist not available." });
    }

    const dayOfWeek = new Date(`${date}T00:00:00`).getDay();
    const hours = await all(
      "SELECT * FROM stylist_hours WHERE stylist_id = ? AND day_of_week = ?",
      [stylistId, dayOfWeek]
    );
    if (!hours.length) {
      return res.status(400).json({ error: "Stylist is not working on this day." });
    }

    const startMinutes = toMinutes(startTime);
    const endMinutes = startMinutes + service.duration_minutes;
    const withinHours = hours.some(
      (h) => startMinutes >= toMinutes(h.start_time) && endMinutes <= toMinutes(h.end_time)
    );
    if (!withinHours) {
      return res.status(400).json({ error: "Requested time is outside working hours." });
    }

    const startIso = toIso(date, startTime);
    const endIso = new Date(new Date(startIso).getTime() + service.duration_minutes * 60000).toISOString();

    const overlap = await get(
      `SELECT id FROM appointments
       WHERE stylist_id = ?
         AND status != 'Cancelled'
         AND start_time < ?
         AND end_time > ?`,
      [stylistId, endIso, startIso]
    );
    if (overlap) {
      return res.status(409).json({ error: "Stylist is already booked for this time." });
    }

    const createdAt = new Date().toISOString();
    const result = await run(
      `INSERT INTO appointments (customer_id, service_id, stylist_id, start_time, end_time, status, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, serviceId, stylistId, startIso, endIso, "Pending", notes || null, createdAt]
    );

    await run(
      "INSERT INTO appointment_status_logs (appointment_id, status, changed_by, changed_at) VALUES (?, ?, ?, ?)",
      [result.id, "Pending", req.user.id, createdAt]
    );

    const appointment = await get("SELECT * FROM appointments WHERE id = ?", [result.id]);
    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const {
      status,
      stylistId,
      categoryId,
      phone,
      date,
      page = 1,
      pageSize = 10,
    } = req.query;

    const filters = [];
    const params = [];

    if (status) {
      filters.push("appointments.status = ?");
      params.push(status);
    }
    if (stylistId) {
      filters.push("appointments.stylist_id = ?");
      params.push(stylistId);
    }
    if (categoryId) {
      filters.push("salon_services.category_id = ?");
      params.push(categoryId);
    }
    if (phone) {
      filters.push("users.phone LIKE ?");
      params.push(`%${phone}%`);
    }
    if (date) {
      const start = new Date(`${date}T00:00:00`).toISOString();
      const end = new Date(`${date}T23:59:59`).toISOString();
      filters.push("appointments.start_time BETWEEN ? AND ?");
      params.push(start, end);
    }

    if (req.user.role === "stylist") {
      const stylist = await get("SELECT id FROM stylists WHERE email = ?", [req.user.email]);
      if (!stylist) {
        return res.json({ items: [], total: 0, page: Number(page), pageSize: Number(pageSize) || 10 });
      }
      filters.push("appointments.stylist_id = ?");
      params.push(stylist.id);
    }
    if (req.user.role === "customer") {
      filters.push("appointments.customer_id = ?");
      params.push(req.user.id);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const totalRow = await get(
      `SELECT COUNT(*) as count
       FROM appointments
       JOIN salon_services ON salon_services.id = appointments.service_id
       JOIN users ON users.id = appointments.customer_id
       ${where}`,
      params
    );

    const limit = Math.min(Number(pageSize) || 10, 100);
    const offset = (Number(page) - 1) * limit;

    const rows = await all(
      `SELECT appointments.*, salon_services.name as service_name,
              service_categories.name as category_name,
              stylists.name as stylist_name,
              users.name as customer_name,
              users.phone as customer_phone
       FROM appointments
       JOIN salon_services ON salon_services.id = appointments.service_id
       JOIN service_categories ON service_categories.id = salon_services.category_id
       JOIN stylists ON stylists.id = appointments.stylist_id
       JOIN users ON users.id = appointments.customer_id
       ${where}
       ORDER BY appointments.start_time DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      items: rows,
      total: totalRow.count,
      page: Number(page),
      pageSize: limit,
    });
  } catch (err) {
    next(err);
  }
});

router.put("/:id/status", requireAuth, async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const { status } = req.body;
    const allowed = ["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status." });
    }
    if (req.user.role === "customer") {
      return res.status(403).json({ error: "Customers cannot update status." });
    }
    const appointment = await get("SELECT * FROM appointments WHERE id = ?", [appointmentId]);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found." });
    }

    await run("UPDATE appointments SET status = ? WHERE id = ?", [status, appointmentId]);
    await run(
      "INSERT INTO appointment_status_logs (appointment_id, status, changed_by, changed_at) VALUES (?, ?, ?, ?)",
      [appointmentId, status, req.user.id, new Date().toISOString()]
    );

    const updated = await get("SELECT * FROM appointments WHERE id = ?", [appointmentId]);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
