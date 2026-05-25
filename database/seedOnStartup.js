const bcrypt = require("bcrypt");
require("dotenv").config();

const db = require("../config/db");

async function ensureTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fullname VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      password VARCHAR(255),
      role ENUM('admin','user') DEFAULT 'user'
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      brand VARCHAR(100),
      price_per_day DECIMAL(10,2),
      status VARCHAR(20) DEFAULT 'available',
      image VARCHAR(255)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      vehicle_id INT,
      start_date DATE,
      end_date DATE,
      total_price DECIMAL(10,2),
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      vehicle_id INT,
      rating INT,
      comment TEXT
    )
  `);
}

async function ensureAdmin() {
  const ADMIN_FULLNAME = process.env.ADMIN_FULLNAME;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_FULLNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log(
      "[SEED] ADMIN_* env vars not set; skipping admin seeding. Set ADMIN_FULLNAME, ADMIN_EMAIL, ADMIN_PASSWORD on Render."
    );
    return;
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // Requires `email` UNIQUE. If it exists, update password/role.
  await db.query(
    `
    INSERT INTO users (fullname, email, password, role)
    VALUES (?, ?, ?, 'admin')
    ON DUPLICATE KEY UPDATE
      fullname = VALUES(fullname),
      password = VALUES(password),
      role = 'admin'
    `,
    [ADMIN_FULLNAME, ADMIN_EMAIL, hashed]
  );

  console.log("[SEED] Admin ensured for email:", ADMIN_EMAIL);
}

async function main() {
  try {
    await ensureTables();
    await ensureAdmin();
  } catch (err) {
    console.error("[SEED] Startup seeding failed:", {
      message: err?.message,
      code: err?.code,
      sqlState: err?.sqlState,
      sqlMessage: err?.sqlMessage
    });
    // Do not crash the server; login should still show errors.
  }
}

main().then(() => {
  console.log("[SEED] Startup seeding finished");
});

