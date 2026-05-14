const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// SESSION
app.use(
  session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: true,
  })
);

// 🔥 DATABASE (AIVEN CONFIG)
const db = mysql.createConnection({
  host: "vehicle-rental-db-render-aiven-lab.h.aivencloud.com",
  user: "avnadmin",
  password: "AVNS_hgekTM0vGgPOHACbD0y",
  database: "defaultdb",
  port: 24936,
  ssl: { rejectUnauthorized: false },
});

// CONNECT DB
db.connect((err) => {
  if (err) {
    console.log("❌ DB Error:", err.message);
  } else {
    console.log("✅ Database connected successfully");
  }
});

/* =========================
   AUTH
========================= */

// REGISTER
app.post("/api/users/register", (req, res) => {
  const { fullname, email, password } = req.body;

  db.query(
    "INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, 'user')",
    [fullname, email, password],
    (err) => {
      if (err) return res.send("Error registering user");
      res.redirect("/login");
    }
  );
});

// LOGIN
app.post("/api/users/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, results) => {
      if (err || results.length === 0) {
        return res.send("User not found");
      }

      req.session.user = results[0];

      // 👇 ROLE CHECK
      if (results[0].role === "admin") {
        return res.redirect("/admin");
      } else {
        return res.redirect("/vehicles");
      }
    }
  );
});

// LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

/* =========================
   PAGES
========================= */

// LOGIN PAGE
app.get("/login", (req, res) => {
  res.render("login");
});

// REGISTER PAGE
app.get("/register", (req, res) => {
  res.render("register");
});

// VEHICLES (USER)
app.get("/vehicles", (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  db.query("SELECT * FROM vehicles", (err, vehicles) => {
    res.render("vehicles", { vehicles });
  });
});

// ADMIN PAGE (ONLY ADMIN)
app.get("/admin", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.send("❌ Access Denied (Admin Only)");
  }

  db.query("SELECT * FROM vehicles", (err, vehicles) => {
    res.render("admin", { vehicles });
  });
});

/* =========================
   VEHICLES
========================= */

// ADD VEHICLE (ADMIN ONLY)
app.post("/api/vehicles/add", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.send("Not allowed");
  }

  const { name, brand, price_per_day } = req.body;

  db.query(
    "INSERT INTO vehicles (vehicle_name, brand, price_per_day, status) VALUES (?, ?, ?, 'available')",
    [name, brand, price_per_day],
    () => {
      res.redirect("/admin");
    }
  );
});

// DELETE VEHICLE
app.post("/api/vehicles/delete/:id", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.send("Not allowed");
  }

  db.query("DELETE FROM vehicles WHERE id=?", [req.params.id], () => {
    res.redirect("/admin");
  });
});

/* =========================
   BOOKINGS
========================= */

// CREATE BOOKING (USER)
app.post("/api/bookings/create", (req, res) => {
  const userId = req.session.user.id;
  const vehicleId = req.body.vehicle_id;

  db.query(
    "INSERT INTO bookings (user_id, vehicle_id, status) VALUES (?, ?, 'pending')",
    [userId, vehicleId],
    () => {
      res.redirect("/vehicles");
    }
  );
});

// APPROVE BOOKING (ADMIN)
app.post("/api/bookings/approve/:id", (req, res) => {
  db.query(
    "UPDATE bookings SET status='approved' WHERE id=?",
    [req.params.id],
    () => res.redirect("/admin")
  );
});

// REJECT BOOKING (ADMIN)
app.post("/api/bookings/reject/:id", (req, res) => {
  db.query(
    "UPDATE bookings SET status='rejected' WHERE id=?",
    [req.params.id],
    () => res.redirect("/admin")
  );
});

/* =========================
   START SERVER
========================= */

app.listen(5001, () => {
  console.log("Server running on port 5001");
});