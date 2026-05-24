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
  const { fullname, email, password, confirmPassword } = req.body;


  if (!fullname || !email || !password || !confirmPassword) {
    return res.send("All fields are required");
  }

  if (password !== confirmPassword) {
    return res.send("Passwords do not match");
  }


  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      return res.send("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, 'user')",
      [fullname, email, hashedPassword]
    );

    res.redirect("/login");
  } catch (err) {
    res.send("Register error");
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) return res.send("User not found");

    const user = rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.send("Incorrect password");

    req.session.user = {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      role: user.role
    };

    if (user.role === "admin") {
      return res.redirect("/admin");
    }

    res.redirect("/dashboard");
  } catch (err) {
    res.send("Login error");
  }
});

module.exports = router;

