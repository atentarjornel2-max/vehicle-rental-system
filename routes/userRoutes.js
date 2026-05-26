const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/db");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| REGISTER USER
|--------------------------------------------------------------------------
*/
router.post("/register", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    // Validate input
    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if email already exists
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user (PostgreSQL RETURNING id)
    const [result] = await db.query(
      "INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, 'user') RETURNING id",
      [fullname, email, hashedPassword]
    );

    // PostgreSQL returns rows array
    const newUserId = result?.[0]?.id;

    // Create session
    req.session.user = {
      id: newUserId,
      fullname,
      email,
      role: "user",
    };

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: req.session.user,
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
});

/*
|--------------------------------------------------------------------------
| LOGIN USER
|--------------------------------------------------------------------------
*/
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Save session
    req.session.user = {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: req.session.user,
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

/*
|--------------------------------------------------------------------------
| LOGOUT USER
|--------------------------------------------------------------------------
*/
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;