const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { db, run, all } = require("./db");

const schemaPath = path.join(__dirname, "schema.sql");

const nowIso = () => new Date().toISOString();

const seed = async () => {
  const schema = fs.readFileSync(schemaPath, "utf-8");
  await new Promise((resolve, reject) => {
    db.exec(schema, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  const existingUsers = await all("SELECT id FROM users LIMIT 1");
  if (existingUsers.length > 0) {
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  await run(
    "INSERT INTO users (name, email, phone, role, password_hash) VALUES (?, ?, ?, ?, ?)",
    ["Admin User", "admin@salon.com", "9999999999", "admin", passwordHash]
  );
  await run(
    "INSERT INTO users (name, email, phone, role, password_hash) VALUES (?, ?, ?, ?, ?)",
    ["Priya Sharma", "priya@salon.com", "8888888888", "stylist", passwordHash]
  );
  await run(
    "INSERT INTO users (name, email, phone, role, password_hash) VALUES (?, ?, ?, ?, ?)",
    ["Customer User", "customer@salon.com", "7777777777", "customer", passwordHash]
  );

  await run("INSERT INTO service_categories (name) VALUES (?)", ["Hair"]);
  await run("INSERT INTO service_categories (name) VALUES (?)", ["Skin"]);
  await run("INSERT INTO service_categories (name) VALUES (?)", ["Nails"]);

  const categories = await all("SELECT id, name FROM service_categories");
  const catId = (name) => categories.find((c) => c.name === name).id;

  await run(
    "INSERT INTO salon_services (category_id, name, price, duration_minutes, is_active) VALUES (?, ?, ?, ?, 1)",
    [catId("Hair"), "Haircut", 30, 45]
  );
  await run(
    "INSERT INTO salon_services (category_id, name, price, duration_minutes, is_active) VALUES (?, ?, ?, ?, 1)",
    [catId("Skin"), "Facial", 60, 60]
  );
  await run(
    "INSERT INTO salon_services (category_id, name, price, duration_minutes, is_active) VALUES (?, ?, ?, ?, 1)",
    [catId("Nails"), "Manicure", 25, 30]
  );

  await run(
    "INSERT INTO stylists (name, email, phone, bio, is_active) VALUES (?, ?, ?, ?, 1)",
    ["Priya Sharma", "priya@salon.com", "9000000001", "Hair stylist with 5 years experience."]
  );
  await run(
    "INSERT INTO stylists (name, email, phone, bio, is_active) VALUES (?, ?, ?, ?, 1)",
    ["Arjun Rao", "arjun@salon.com", "9000000002", "Skincare specialist."]
  );
  await run(
    "INSERT INTO stylists (name, email, phone, bio, is_active) VALUES (?, ?, ?, ?, 1)",
    ["Neha Kapoor", "neha@salon.com", "9000000003", "Nail artist and spa expert."]
  );

  const stylists = await all("SELECT id FROM stylists");
  for (const stylist of stylists) {
    for (let day = 1; day <= 6; day += 1) {
      await run(
        "INSERT INTO stylist_hours (stylist_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)",
        [stylist.id, day, "10:00", "19:00"]
      );
    }
  }

  await run(
    "INSERT INTO appointments (customer_id, service_id, stylist_id, start_time, end_time, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [3, 1, 1, "2026-05-25T10:00:00.000Z", "2026-05-25T10:45:00.000Z", "Confirmed", "First visit", nowIso()]
  );

  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
