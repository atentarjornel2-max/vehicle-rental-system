const db = require("../config/db");

const sql = `
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    vehicle_id INT,
    start_date DATE,
    end_date DATE,
    total_price DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;


db.query(sql, (err) => {
    if (err) {
        console.log("❌ Error creating bookings table:", err.message);
    } else {
        console.log("✅ Bookings table created successfully");
    }

    process.exit();
});