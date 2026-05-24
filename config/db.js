const mysql = require("mysql2/promise");
require("dotenv").config();

const requiredEnv = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME"
];

const missing = requiredEnv.filter((k) => !process.env[k]);

if (missing.length) {
  // Fail fast on Render so the real cause shows up immediately in logs.
  console.error("[DB CONFIG ERROR] Missing env vars:", missing);
  console.error("[DB CONFIG ERROR] Current env snapshot:", {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME
  });
  throw new Error(`Missing required DB env vars: ${missing.join(", ")}`);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    rejectUnauthorized: false
  },

  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;

