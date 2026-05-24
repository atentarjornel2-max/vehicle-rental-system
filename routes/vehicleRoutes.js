const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ================= ADD VEHICLE =================
router.post("/add", (req, res) => {
  const { name, brand, price_per_day, status } = req.body;

  const finalStatus = status || "available";

  db.query(
    `
    INSERT INTO vehicles (name, brand, price_per_day, status)
    VALUES (?, ?, ?, ?)
    `,
    [name, brand, price_per_day, finalStatus],
    (err) => {
      if (err) return res.send(err);
      res.redirect("/admin");
    }
  );
});

// ================= DELETE VEHICLE =================
router.post("/delete/:id", (req, res) => {

    db.query(
        "DELETE FROM vehicles WHERE id = ?",
        [req.params.id],
        (err) => {

            if (err) return res.send(err);

            res.redirect("/admin");
        }
    );
});

// ================= EDIT VEHICLE =================
router.post("/edit/:id", (req, res) => {

    const {
        name,
        brand,
        price_per_day,
        status
    } = req.body;

    db.query(
        `
        UPDATE vehicles
        SET
            name = ?,
            brand = ?,
            price_per_day = ?,
            status = ?
        WHERE id = ?
        `,
        [
            name,
            brand,
            price_per_day,
            status,
            req.params.id
        ],
        (err) => {

            if (err) return res.send(err);

            res.redirect("/admin");
        }
    );
});

module.exports = router;