const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ================= CREATE BOOKING =================
router.post("/create", (req, res) => {

    const { vehicle_id } = req.body;

    db.query(
        `
        INSERT INTO bookings (
            user_id,
            vehicle_id
        )
        VALUES (?, ?)
        `,
        [
            req.session.user.id,
            vehicle_id
        ],
        (err) => {

            if (err) return res.send(err);

            res.redirect("/my-bookings");
        }
    );
});

// ================= APPROVE BOOKING =================
router.post("/approve/:id", (req, res) => {

    db.query(
        `
        UPDATE bookings
        SET status = 'approved'
        WHERE id = ?
        `,
        [req.params.id],
        (err) => {

            if (err) return res.send(err);

            res.redirect("/admin");
        }
    );
});

// ================= REJECT BOOKING =================
router.post("/reject/:id", (req, res) => {

    db.query(
        `
        UPDATE bookings
        SET status = 'rejected'
        WHERE id = ?
        `,
        [req.params.id],
        (err) => {

            if (err) return res.send(err);

            res.redirect("/admin");
        }
    );
});

module.exports = router;