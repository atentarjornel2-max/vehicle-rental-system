const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/db");

function requireNoLogin(req, res, next) {
  if (req.session?.user?.id) {
    return res.redirect(req.session.user.role === "admin" ? "/admin" : "/dashboard");
  }
  next();
}


// ================= REGISTER =================
router.post("/register", requireNoLogin, async (req, res) => {

  const { fullname, email, password, confirmPassword } = req.body || {};

// UI form posts here (no Postman). Use redirects + session creation.
  if (!fullname || !email || !password || !confirmPassword) {
    return res.status(400).send("All fields are required");
  }

  if (password !== confirmPassword) {
    return res.status(400).send("Passwords do not match");
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      return res.status(409).send("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, 'user')",
      [fullname, email, hashedPassword]
    );

    // auto-login after register
    const newUserId = result?.insertId;
    const [createdRows] = await db.query("SELECT id, fullname, email, role FROM users WHERE id = ?", [newUserId]);
    const user = createdRows?.[0];

    if (user?.id) {
      req.session.user = {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role
      };

      return res.redirect(user.role === "admin" ? "/admin" : "/dashboard");
    }

    return res.redirect("/login");
  } catch (err) {
    console.error("[REGISTER ERROR]", {
      message: err?.message,
      code: err?.code,
      errno: err?.errno,
      sqlState: err?.sqlState,
      fatal: err?.fatal
    });
    return res.status(500).send("Register error");
  }

});


module.exports = router;


