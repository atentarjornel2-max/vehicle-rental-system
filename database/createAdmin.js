const mysql = require("mysql2");

// SAME CONNECTION AS SERVER
const db = mysql.createConnection({
  host: "YOUR_AIVEN_HOST",
  user: "avnadmin",
  password: "YOUR_PASSWORD",
  database: "defaultdb",
  port: 24936,
  ssl: { rejectUnauthorized: false },
});

db.connect((err) => {
  if (err) {
    return console.log("❌ DB Error:", err.message);
  }

  console.log("✅ Connected to DB");

  // CREATE ADMIN USER
  const sql =
    "INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, ?)";

  db.query(
    sql,
    ["Admin", "admin@gmail.com", "123456", "admin"],
    (err, result) => {
      if (err) {
        return console.log("❌ Insert Error:", err.message);
      }

      console.log("✅ Admin created successfully!");
      db.end();
    }
  );
});