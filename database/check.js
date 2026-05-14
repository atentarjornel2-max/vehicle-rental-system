const db = require("../config/db");

db.query("SHOW TABLES", (err, results) => {
    if (err) {
        console.log(err.message);
    } else {
        console.log("Tables in database:");
        console.log(results);
    }

    process.exit();
});