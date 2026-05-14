const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "vehicle-rental-db-render-aiven-lab.h.aivencloud.com",
  user: "avnadmin",
  password: "YAVNS_hgekTM0vGgPOHACbD0y",
  database: "defaultdb",
  port: 24936,
  ssl: { rejectUnauthorized: false },
});

db.connect();

// USERS TABLE (PRODUCTION READY)
db.query(`
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role ENUM('admin','user') DEFAULT 'user'
)
`, (err) => {
  if (err) console.log(err);
  else console.log("Users table ready");
  db.end();
});