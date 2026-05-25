const bcrypt = require("bcrypt");
const db = require("../config/db");

/**
 * Secure admin seeding script.
 *
 * Usage (local):
 *  ADMIN_FULLNAME="Admin" \
 *  ADMIN_EMAIL="admin@gmail.com" \
 *  ADMIN_PASSWORD="change_me" \
 *  node database/createAdmin.js
 *
 * Or set these env vars in Render.
 */

async function main() {
  const ADMIN_FULLNAME = process.env.ADMIN_FULLNAME;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_FULLNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(
      "Missing env vars for createAdmin.js. Set: ADMIN_FULLNAME, ADMIN_EMAIL, ADMIN_PASSWORD"
    );
    process.exit(1);
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // Upsert-like behavior (if email already exists, update role/password)
  // Requires `email` unique. If it's not unique, createAdmin will insert duplicates.
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

  console.log("✅ Admin ensured for email:", ADMIN_EMAIL);
}

main()
  .then(() => {
    // mysql2 pool - close after completion
    return db.end?.();
  })
  .catch((err) => {
    console.error("❌ createAdmin error:", err);
    process.exit(1);
  });

