const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
require("dotenv").config();


const db = require("./config/db");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(
  session({
    // Render error fix: express-session requires a non-empty secret in production
    secret: process.env.SESSION_SECRET || "dev_session_secret",
    resave: false,
    saveUninitialized: false
  })
);

// ================= HOME =================
app.get("/", (req, res) => {
  // If logged in, send them to the right dashboard.
  if (req.session?.user?.id) {
    if (req.session.user.role === "admin") return res.redirect("/admin");
    return res.redirect("/dashboard");
  }
  res.render("index");
});


// (register route is handled by routes/userRoutes.js)

// ================= LOGIN =================

app.post("/login", async (req, res) => {
  const { email, password } = req.body || {};


  try {
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      console.error("[DB CONFIG ERROR] Missing env vars", {
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_NAME: process.env.DB_NAME
      });
    }

    const [users] = await db.query(
      "SELECT * FROM users WHERE email=?",
      [email]
    );


    if (users.length === 0) return res.send("User not found");

    const user = users[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.send("Wrong password");

    // Unify session shape with routes/userRoutes.js
    req.session.user = {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      role: user.role
    };

    if (user.role === "admin") {
      return res.redirect("/admin");
    }

    return res.redirect("/dashboard");
  } catch (err) {
    // Log full DB error details so Render logs show the real root cause.
    console.error("[LOGIN ERROR]", {
      message: err?.message,
      code: err?.code,
      errno: err?.errno,
      sqlState: err?.sqlState,
      fatal: err?.fatal,
      sqlMessage: err?.sqlMessage,
      stack: err?.stack,
      // Don't leak secrets; just show which endpoint we're connecting to.
      dbConfigSnapshot: {
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_USER: process.env.DB_USER,
        DB_NAME: process.env.DB_NAME,
        sslRejectUnauthorized: Boolean(
          // mysql2 passes this as part of ssl config; keep a boolean snapshot.
          false
        )
      }
    });

    return res.status(500).send("DB error (check server logs)");
  }
});



// ================= ROUTES =================
const userRoutes = require("./routes/userRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// API
app.use("/api/users", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);

// Auth helpers
const { requireLogin, requireAdmin } = require("./middleware/auth");


// Pages
app.get("/login", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));



app.get("/vehicles", requireLogin, async (req, res) => {
  const [vehicles] = await db.query(
    "SELECT id, name, brand, price_per_day, status, image FROM vehicles ORDER BY id DESC"
  );
  res.render("vehicles", { vehicles });
});

app.get("/my-bookings", requireLogin, async (req, res) => {
  const [rows] = await db.query(
    `
    SELECT b.*, v.name AS vehicle_name, v.brand AS vehicle_brand
    FROM bookings b
    JOIN vehicles v ON v.id = b.vehicle_id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
    `,
    [req.session.user.id]
  );

  const bookings = rows.map(r => ({
    ...r,
    status_class:
      r.status === "approved" ? "badge--green" :
      r.status === "rejected" ? "badge--red" :
      "badge--yellow"
  }));

  res.render("my-bookings", { bookings });
});

app.get("/dashboard", requireLogin, async (req, res) => {
  const [pending] = await db.query(
    "SELECT COUNT(*) AS c FROM bookings WHERE user_id=? AND status='pending'",
    [req.session.user.id]
  );
  const [approved] = await db.query(
    "SELECT COUNT(*) AS c FROM bookings WHERE user_id=? AND status='approved'",
    [req.session.user.id]
  );

  res.render("dashboard", {
    pending: pending[0]?.c || 0,
    approved: approved[0]?.c || 0
  });
});

app.get("/admin", requireAdmin, async (req, res) => {
  const [vehicles] = await db.query("SELECT * FROM vehicles ORDER BY id DESC");
  const [pendingBookings] = await db.query(
    `
    SELECT b.*, v.name AS vehicle_name, v.brand AS vehicle_brand, u.fullname
    FROM bookings b
    JOIN vehicles v ON v.id=b.vehicle_id
    JOIN users u ON u.id=b.user_id
    WHERE b.status='pending'
    ORDER BY b.created_at DESC
    `
  );

  res.render("admin", { vehicles, pendingBookings });
});

app.get("/admin/vehicles", requireAdmin, async (req, res) => {
  const [vehicles] = await db.query("SELECT * FROM vehicles ORDER BY id DESC");
  res.render("admin-vehicles", { vehicles });
});

app.get("/admin/bookings", requireAdmin, async (req, res) => {
  const [bookings] = await db.query(
    `
    SELECT b.*, v.name AS vehicle_name, v.brand AS vehicle_brand, u.fullname
    FROM bookings b
    JOIN vehicles v ON v.id=b.vehicle_id
    JOIN users u ON u.id=b.user_id
    ORDER BY b.created_at DESC
    `
  );
  res.render("admin-bookings", { bookings });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// ================= ERROR HANDLER (logs stack trace) =================
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).send("Internal Server Error");
});

// ================= START SERVER =================
app.listen(process.env.PORT || 5001, () => {
  console.log("Server running");
});

