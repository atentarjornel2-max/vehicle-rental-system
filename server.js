require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();

// =====================
// MIDDLEWARE
// =====================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(
  session({
    secret: "vehicle_rental_secret",
    resave: false,
    saveUninitialized: false,
  })
);

// =====================
// DATABASE CONNECTION
// =====================
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});

db.connect((err) => {
  if (err) {
    console.log("❌ DB Error:", err.message);
  } else {
    console.log("✅ Database connected successfully");
  }
});

// =====================
// HOME ROUTE (FIX FOR "Cannot GET /")
// =====================
app.get("/", (req, res) => {
  res.redirect("/login");
});

// =====================
// LOGIN PAGE
// =====================
app.get("/login", (req, res) => {
  res.render("login");
});

// =====================
// REGISTER PAGE
// =====================
app.get("/register", (req, res) => {
  res.render("register");
});

// =====================
// REGISTER USER
// =====================
app.post("/register", async (req, res) => {
  const { fullname, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, 'user')",
    [fullname, email, hashedPassword],
    (err) => {
      if (err) {
        console.log(err);
        return res.send("❌ Register failed");
      }
      res.redirect("/login");
    }
  );
});

// =====================
// LOGIN USER (FIXED)
// =====================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.send("❌ User not found");
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.send("❌ Wrong password");
    }

    req.session.user = user;

    if (user.role === "admin") {
      return res.redirect("/admin");
    } else {
      return res.redirect("/vehicles");
    }
  });
});

// =====================
// MIDDLEWARE (AUTH CHECK)
// =====================
function isLoggedIn(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

function isAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.send("❌ Access denied (Admin only)");
  }
  next();
}

// =====================
// USER VEHICLES PAGE
// =====================
app.get("/vehicles", isLoggedIn, (req, res) => {
  db.query("SELECT * FROM vehicles", (err, results) => {
    if (err) return res.send("Error loading vehicles");

    res.render("vehicles", {
      user: req.session.user,
      vehicles: results,
    });
  });
});

// =====================
// ADMIN DASHBOARD
// =====================
app.get("/admin", isAdmin, (req, res) => {
  db.query("SELECT * FROM vehicles", (err, vehicles) => {
    if (err) return res.send("Error");

    db.query("SELECT * FROM bookings", (err2, bookings) => {
      if (err2) return res.send("Error");

      res.render("admin", {
        user: req.session.user,
        vehicles,
        bookings,
      });
    });
  });
});

// =====================
// LOGOUT
// =====================
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});