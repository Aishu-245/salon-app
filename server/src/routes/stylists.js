const express = require("express");
const { all, get, run } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const toIso = (date, time) => {
  const value = new Date(`${date}T${time}:00`);
  return value.toISOString();
};

router.get("/", async (req, res, next) => {
  try {
    const activeOnly = req.query.active === "1";
    const rows = await all(
      `SELECT * FROM stylists ${activeOnly ? "WHERE is_active = 1" : ""} ORDER BY name`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requireRole(["admin"]), async (req, res, next) => {
  try {
    const { name, email, phone, bio, isActive, hours } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required." });
    }
    const result = await run(
      "INSERT INTO stylists (name, email, phone, bio, is_active) VALUES (?, ?, ?, ?, ?)",
      [name, email || null, phone || null, bio || null, isActive ? 1 : 0]
    );
    const stylistId = result.id;
    if (Array.isArray(hours)) {
      for (const hour of hours) {
        if (
          typeof hour.dayOfWeek !== "number" ||
          !hour.startTime ||
          !hour.endTime
        ) {
          return res.status(400).json({ error: "Invalid stylist hours." });
        }
        await run(
          "INSERT INTO stylist_hours (stylist_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)",
          [stylistId, hour.dayOfWeek, hour.startTime, hour.endTime]
        );
      }
    }
    const created = await get("SELECT * FROM stylists WHERE id = ?", [stylistId]);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, requireRole(["admin"]), async (req, res, next) => {
  try {
    const stylistId = req.params.id;
    const { name, email, phone, bio, isActive, hours } = req.body;
    const stylist = await get("SELECT * FROM stylists WHERE id = ?", [stylistId]);
    if (!stylist) {
      return res.status(404).json({ error: "Stylist not found." });
    }

    await run(
      "UPDATE stylists SET name = ?, email = ?, phone = ?, bio = ?, is_active = ? WHERE id = ?",
      [
        name || stylist.name,
        email ?? stylist.email,
        phone ?? stylist.phone,
        bio ?? stylist.bio,
        typeof isActive === "boolean" ? (isActive ? 1 : 0) : stylist.is_active,
        stylistId,
      ]
    );

    if (Array.isArray(hours)) {
      await run("DELETE FROM stylist_hours WHERE stylist_id = ?", [stylistId]);
      for (const hour of hours) {
        await run(
          "INSERT INTO stylist_hours (stylist_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)",
          [stylistId, hour.dayOfWeek, hour.startTime, hour.endTime]
        );
      }
    }

    const updated = await get("SELECT * FROM stylists WHERE id = ?", [stylistId]);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.get("/availability", async (req, res, next) => {
  try {
    const { serviceId, date, startTime } = req.query;
    if (!serviceId || !date || !startTime) {
      return res.status(400).json({ error: "serviceId, date, and startTime are required." });
    }
    const service = await get("SELECT * FROM salon_services WHERE id = ?", [serviceId]);
    if (!service) {
      return res.status(404).json({ error: "Service not found." });
    }

    const startIso = toIso(date, startTime);
    const endIso = new Date(new Date(startIso).getTime() + service.duration_minutes * 60000).toISOString();

    const dayOfWeek = new Date(`${date}T00:00:00`).getDay();
    const hours = await all(
      "SELECT * FROM stylist_hours WHERE day_of_week = ?",
      [dayOfWeek]
    );

    const stylists = await all("SELECT * FROM stylists WHERE is_active = 1 ORDER BY name");
    const available = [];

    for (const stylist of stylists) {
      const stylistHours = hours.filter((h) => h.stylist_id === stylist.id);
      if (!stylistHours.length) continue;

      const startMinutes = toMinutes(startTime);
      const endMinutes = startMinutes + service.duration_minutes;
      const withinHours = stylistHours.some((h) => {
        return startMinutes >= toMinutes(h.start_time) && endMinutes <= toMinutes(h.end_time);
      });
      if (!withinHours) continue;

      const overlap = await get(
        `SELECT id FROM appointments
         WHERE stylist_id = ?
           AND status != 'Cancelled'
           AND start_time < ?
           AND end_time > ?`,
        [stylist.id, endIso, startIso]
      );
      if (!overlap) {
        available.push(stylist);
      }
    }

    res.json({ startTime: startIso, endTime: endIso, stylists: available });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/schedule", requireAuth, async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "date is required." });
    }
    const start = new Date(`${date}T00:00:00`).toISOString();
    const end = new Date(`${date}T23:59:59`).toISOString();
    const rows = await all(
      `SELECT appointments.*, salon_services.name as service_name, users.name as customer_name
       FROM appointments
       JOIN salon_services ON salon_services.id = appointments.service_id
       JOIN users ON users.id = appointments.customer_id
       WHERE appointments.stylist_id = ?
         AND appointments.start_time BETWEEN ? AND ?
       ORDER BY appointments.start_time`,
      [req.params.id, start, end]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
