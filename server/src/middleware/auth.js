const { get } = require("../db");

const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Missing auth token." });
  }

  const session = await get(
    "SELECT sessions.token, sessions.expires_at, users.id, users.name, users.email, users.role FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token = ?",
    [token]
  );
  if (!session) {
    return res.status(401).json({ error: "Invalid session." });
  }
  if (new Date(session.expires_at).getTime() < Date.now()) {
    return res.status(401).json({ error: "Session expired." });
  }

  req.user = {
    id: session.id,
    name: session.name,
    email: session.email,
    role: session.role,
  };
  return next();
};

const requireRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden." });
  }
  return next();
};

module.exports = { requireAuth, requireRole };
