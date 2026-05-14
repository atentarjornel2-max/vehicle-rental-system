const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ================= ADD REVIEW =================
router.post("/add", (req, res) => {

    const { vehicle_id, rating, comment } = req.body;

    db.query(
        `
        INSERT INTO reviews (user_id, vehicle_id, rating, comment)
        VALUES (?, ?, ?, ?)
        `,
        [
            req.session.user.id,
            vehicle_id,
            rating,
            comment
        ],
        (err) => {

            if (err) return res.send(err);

            res.redirect("/vehicles");
        }
    );
});

module.exports = router;