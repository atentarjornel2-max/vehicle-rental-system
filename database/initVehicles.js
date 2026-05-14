const db = require("../config/db");

const sql = `
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_name VARCHAR(100),
    brand VARCHAR(100),
    price_per_day DECIMAL(10,2),
    status VARCHAR(50),
    image VARCHAR(255)
);
`;

db.query(sql, (err) => {
    if (err) {
        console.log("❌ Error creating table:", err.message);
    } else {
        console.log("✅ Vehicles table created successfully");
    }

    process.exit(); // close script after running
});