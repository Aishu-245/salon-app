const express = require("express");
const { all, get, run } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { active, categoryId } = req.query;
    const filters = [];
    const params = [];
    if (active === "1") {
      filters.push("salon_services.is_active = 1");
    }
    if (categoryId) {
      filters.push("salon_services.category_id = ?");
      params.push(categoryId);
    }
    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const rows = await all(
      `SELECT salon_services.*, service_categories.name as category_name
       FROM salon_services
       JOIN service_categories ON service_categories.id = salon_services.category_id
       ${where}
       ORDER BY salon_services.name`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requireRole(["admin"]), async (req, res, next) => {
  try {
    const { categoryId, name, price, durationMinutes, isActive } = req.body;
    if (!categoryId || !name || !price || !durationMinutes) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    const category = await get("SELECT id FROM service_categories WHERE id = ?", [categoryId]);
    if (!category) {
      return res.status(400).json({ error: "Invalid category." });
    }

    const result = await run(
      "INSERT INTO salon_services (category_id, name, price, duration_minutes, is_active) VALUES (?, ?, ?, ?, ?)",
      [categoryId, name, price, durationMinutes, isActive ? 1 : 0]
    );

    const created = await get(
      `SELECT salon_services.*, service_categories.name as category_name
       FROM salon_services
       JOIN service_categories ON service_categories.id = salon_services.category_id
       WHERE salon_services.id = ?`,
      [result.id]
    );
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.get("/categories", async (req, res, next) => {
  try {
    const rows = await all("SELECT * FROM service_categories ORDER BY name");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/categories",
  requireAuth,
  requireRole(["admin"]),
  async (req, res, next) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Name is required." });
      }
      const result = await run(
        "INSERT INTO service_categories (name) VALUES (?)",
        [name]
      );
      const created = await get("SELECT * FROM service_categories WHERE id = ?", [result.id]);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
