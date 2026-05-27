require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");

const initDatabase = require("./database/initDatabase");
const seedOnStartup = require("./database/seedOnStartup");

const userRoutes = require("./routes/userRoutes");
const { requireLogin, requireAdmin } = require("./middleware/auth");

const db = require("./config/db");

const app = express();

const PORT = process.env.PORT || 5001;

/*
|--------------------------------------------------------------------------
| MIDDLEWARE
|--------------------------------------------------------------------------
*/

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());

app.use(express.urlencoded({
  extended: true,
}));


app.use(
  session({
    secret: process.env.SESSION_SECRET || "vehicle-rental-secret",
    resave: false,
    saveUninitialized: false,

    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

/*
|--------------------------------------------------------------------------
| STATIC FILES
|--------------------------------------------------------------------------
*/

app.use(express.static(
  path.join(__dirname, "public")
));

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {

  res.send(`
    <h1>Vehicle Rental System</h1>
    <p>Server is running successfully.</p>
  `);

});

app.use("/api/users", userRoutes);

/*
|--------------------------------------------------------------------------
| HTML PAGES (EJS)
|--------------------------------------------------------------------------
*/

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/dashboard", requireLogin, async (req, res) => {
  try {
    const [pendingRows] = await db.query(
      "SELECT * FROM bookings WHERE user_id = ? AND status = 'pending'",
      [req.session.user.id]
    );
    const [approvedRows] = await db.query(
      "SELECT * FROM bookings WHERE user_id = ? AND status = 'approved'",
      [req.session.user.id]
    );

    res.render("dashboard", {
      pending: pendingRows.length,
      approved: approvedRows.length,
    });
  } catch (err) {
    res.status(500).send(String(err.message || err));
  }
});

app.get("/vehicles", requireLogin, async (req, res) => {
  try {
    const [vehicles] = await db.query(
      "SELECT id, name, brand, price_per_day, image, availability FROM vehicles WHERE availability = true"
    );
    res.render("vehicles", { vehicles });
  } catch (err) {
    res.status(500).send(String(err.message || err));
  }
});

app.get("/my-bookings", requireLogin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        b.id,
        b.user_id,
        b.vehicle_id,
        b.start_date,
        b.end_date,
        b.total_price,
        b.status,
        v.name AS vehicle_name,
        v.brand AS vehicle_brand
      FROM bookings b
      JOIN vehicles v ON v.id = b.vehicle_id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
      `,
      [req.session.user.id]
    );

    res.render("my-bookings", {
      bookings: rows.map((b) => ({
        ...b,
        status_class:
          b.status === "approved" ? "badge--green" : b.status === "rejected" ? "badge--red" : b.status === "cancelled" ? "badge--yellow" : "badge--yellow",
      })),
    });
  } catch (err) {
    res.status(500).send(String(err.message || err));
  }
});

app.get("/admin", requireAdmin, async (req, res) => {
  try {
    const [vehicles] = await db.query("SELECT id, name, brand, price_per_day, status FROM vehicles");
    const [pendingBookings] = await db.query(
      `
      SELECT 
        b.id,
        b.start_date,
        b.end_date,
        b.total_price,
        b.status,
        u.fullname,
        v.name AS vehicle_name
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      JOIN vehicles v ON v.id = b.vehicle_id
      WHERE b.status = 'pending'
      ORDER BY b.created_at DESC
      `
    );

    res.render("admin", { vehicles, pendingBookings });
  } catch (err) {
    res.status(500).send(String(err.message || err));
  }
});

app.get("/admin/vehicles", requireAdmin, async (req, res) => {
  try {
    const [vehicles] = await db.query(
      "SELECT id, name, brand, price_per_day, status, availability FROM vehicles ORDER BY created_at DESC"
    );
    res.render("admin-vehicles", { vehicles });
  } catch (err) {
    res.status(500).send(String(err.message || err));
  }
});

app.get("/admin/bookings", requireAdmin, async (req, res) => {
  try {
    const [bookings] = await db.query(
      `
      SELECT 
        b.id,
        b.start_date,
        b.end_date,
        b.total_price,
        b.status,
        u.fullname,
        v.name AS vehicle_name,
        v.brand AS vehicle_brand
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      JOIN vehicles v ON v.id = b.vehicle_id
      ORDER BY b.created_at DESC
      `
    );

    res.render("admin-bookings", { bookings });
  } catch (err) {
    res.status(500).send(String(err.message || err));
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

async function startServer() {

  try {

    await initDatabase();

    await seedOnStartup();

    app.listen(PORT, () => {

      console.log("=================================");
      console.log("Vehicle Rental System Running");
      console.log("PORT:", PORT);
      console.log("=================================");

    });

  } catch (error) {

    console.error("[SERVER START ERROR]", error.message);

  }

}

startServer();