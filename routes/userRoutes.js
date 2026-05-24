const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/db");

function requireNoLogin(req, res, next) {
  if (req.session?.user?.id) return res.redirect("/dashboard");
  next();
}

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  const { fullname, email, password, confirmPassword } = req.body || {};

  // API endpoint should respond with JSON, not redirects
  if (!fullname || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, 'user')",
      [fullname, email, hashedPassword]
    );

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("[REGISTER ERROR]", {
      message: err?.message,
      code: err?.code,
      errno: err?.errno,
      sqlState: err?.sqlState,
      fatal: err?.fatal
    });
    return res.status(500).json({ error: "Register error" });
  }
});


module.exports = router;


