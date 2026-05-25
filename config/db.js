const mysql = require("mysql2/promise");
require("dotenv").config();

const requiredEnv = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];
const missing = requiredEnv.filter((k) => !process.env[k]);

if (missing.length) {
  console.error("[DB CONFIG ERROR] Missing env vars:", missing);
  throw new Error(`Missing required DB env vars: ${missing.join(", ")}`);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
});

// ✅ Test connection at startup so the real error shows immediately in logs
pool.getConnection()
  .then((conn) => {
    console.log("[DB] Connected successfully to", process.env.DB_HOST);
    conn.release();
  })
  .catch((err) => {
    console.error("[DB CONNECTION FAILED]", {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
    });
  });

module.exports = pool;