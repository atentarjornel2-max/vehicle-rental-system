const db = require("../config/db");

const sql = `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(255),
    role VARCHAR(50)
);
`;

db.query(sql, (err) => {
    if (err) {
        console.log("❌ Table creation failed:", err.message);
    } else {
        console.log("✅ Users table created successfully");
    }

    process.exit();
});