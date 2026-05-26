const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("[DB CONNECTION FAILED]", err.message);
  } else {
    console.log("[DB] Connected to PostgreSQL");
    release();
  }
});

// Wrapper to support mysql2-style queries
const db = {
  query: async (sql, params = []) => {
    let i = 0;

    const convertedSql = sql.replace(/\?/g, () => `$${++i}`);

    const result = await pool.query(convertedSql, params);

    return [result.rows];
  },
};

module.exports = db;