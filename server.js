require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");

const initDatabase = require("./database/initDatabase");
const seedOnStartup = require("./database/seedOnStartup");

const userRoutes = require("./routes/userRoutes");

const app = express();

const PORT = process.env.PORT || 10000;

/*
|--------------------------------------------------------------------------
| MIDDLEWARE
|--------------------------------------------------------------------------
*/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use(express.static(path.join(__dirname, "public")));

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
| DATABASE INITIALIZATION
|--------------------------------------------------------------------------
*/

async function startServer() {
  try {

    // Initialize PostgreSQL tables
    await initDatabase();

    // Seed sample vehicles
    await seedOnStartup();

    // Start server
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