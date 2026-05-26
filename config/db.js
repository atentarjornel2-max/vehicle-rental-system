const { Pool } = require("pg");

require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    rejectUnauthorized: false,
  },
});

// Test connection
pool.connect()
  .then(client => {
    console.log("[DB] Connected to PostgreSQL");
    client.release();
  })
  .catch(err => {
    console.error("[DB CONNECTION FAILED]", err.message);
  });

// MySQL-style wrapper
const db = {
  query: async (sql, params = []) => {

    let i = 0;

    const convertedSql = sql.replace(/\?/g, () => `$${++i}`);

    const result = await pool.query(convertedSql, params);

    return [result.rows];
  }
};

module.exports = db;