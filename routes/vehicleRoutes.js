const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ================= ADD VEHICLE =================
router.post("/add", async (req, res) => {
  const { name, brand, price_per_day, status } = req.body;

  const finalStatus = status || "available";

  try {
    await db.query(
      "INSERT INTO vehicles (name, brand, price_per_day, status) VALUES (?, ?, ?, ?)",
      [name, brand, price_per_day, finalStatus]
    );
    res.redirect("/admin");
  } catch (err) {
    res.status(500).send(String(err.message || err));
  }
});


// ================= DELETE VEHICLE =================
router.post("/delete/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM vehicles WHERE id = ?", [req.params.id]);
    res.redirect("/admin");
  } catch (err) {
    res.status(500).send(String(err.message || err));
  }
});


// ================= EDIT VEHICLE =================
router.post("/edit/:id", async (req, res) => {
  const { name, brand, price_per_day, status } = req.body;

  const finalStatus = status || "available";

  try {
    await db.query(
      "UPDATE vehicles SET name = ?, brand = ?, price_per_day = ?, status = ? WHERE id = ?",
      [name, brand, price_per_day, finalStatus, req.params.id]
    );
    res.redirect("/admin");
  } catch (err) {
    res.status(500).send(String(err.message || err));
  }
});



module.exports = router;