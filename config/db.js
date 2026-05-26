const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

pool.connect()
  .then(client => {
    console.log("[DB] Connected to PostgreSQL:", process.env.DB_HOST);
    client.release();
  })
  .catch(err => console.error("[DB CONNECTION FAILED]", err.message));

// Wrap to match your existing mysql2 usage: db.query() returns [rows]
const db = {
  query: async (sql, params) => {
    // Convert MySQL ? placeholders to PostgreSQL $1, $2, ...
    let i = 0;
    const pgSql = sql.replace(/\?/g, () => `$${++i}`);
    const result = await pool.query(pgSql, params);
    return [result.rows, result.fields];
  }
};

module.exports = db;