const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ================= CREATE BOOKING =================
// Expects: vehicle_id, start_date, end_date
router.post("/create", async (req, res) => {
  try {
    if (!req.session?.user?.id) return res.redirect("/login");

    const { vehicle_id, start_date, end_date } = req.body;

    if (!vehicle_id || !start_date || !end_date) {
      return res.send("vehicle_id, start_date and end_date are required");
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return res.send("Invalid dates");
    if (end < start) return res.send("end_date must be >= start_date");

    const vehicleRows = await db.query(
      "SELECT id, price_per_day FROM vehicles WHERE id = ?",
      [vehicle_id]
    );

    const vehicle = vehicleRows[0]?.[0] || vehicleRows[0]?.[0];
    const pricePerDay = vehicle?.price_per_day;
    if (!pricePerDay) return res.send("Vehicle not found");

    // nights/days count (simple inclusive days)
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1;
    const totalPrice = Number(days) * Number(pricePerDay);

    const sql = `
      INSERT INTO bookings (user_id, vehicle_id, start_date, end_date, total_price, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `;

    await db.query(sql, [req.session.user.id, vehicle_id, start_date, end_date, totalPrice]);
    res.redirect("/my-bookings");
  } catch (err) {
    res.send(String(err.message || err));
  }
});

// ================= APPROVE BOOKING (transaction + conflict check) =================
router.post("/approve/:id", async (req, res) => {
  try {
    if (req.session?.user?.role !== "admin") return res.status(403).send("No access");

    const bookingId = req.params.id;

    await db.query("START TRANSACTION");

    const [bookingRows] = await db.query(
      `
      SELECT * FROM bookings WHERE id = ? FOR UPDATE
      `,
      [bookingId]
    );

    const booking = bookingRows?.[0] || bookingRows?.[0];
    if (!booking) {
      await db.query("ROLLBACK");
      return res.send("Booking not found");
    }

    if (booking.status !== "pending") {
      await db.query("ROLLBACK");
      return res.send("Booking is not pending");
    }

    // Overlap check with other approved bookings for the same vehicle
    const [conflicts] = await db.query(
      `
      SELECT id
      FROM bookings
      WHERE vehicle_id = ?
        AND status = 'approved'
        AND id <> ?
        AND NOT (end_date < ? OR start_date > ?)
      `,
      [booking.vehicle_id, bookingId, booking.start_date, booking.end_date]
    );

    if (conflicts.length > 0) {
      await db.query("ROLLBACK");
      return res.send("Cannot approve: vehicle is already booked for these dates");
    }

    await db.query(
      "UPDATE bookings SET status = 'approved' WHERE id = ?",
      [bookingId]
    );

    await db.query("COMMIT");
    res.redirect("/admin");
  } catch (err) {
    try { await db.query("ROLLBACK"); } catch (e) {}
    res.send(String(err.message || err));
  }
});

// ================= REJECT BOOKING =================
router.post("/reject/:id", async (req, res) => {
  try {
    if (req.session?.user?.role !== "admin") return res.status(403).send("No access");

    const bookingId = req.params.id;

    await db.query(
      "UPDATE bookings SET status = 'rejected' WHERE id = ?",
      [bookingId]
    );

    res.redirect("/admin");
  } catch (err) {
    res.send(String(err.message || err));
  }
});

// ================= USER CANCEL BOOKING =================
// Allows: user cancels their own booking when status is pending or approved
router.post("/cancel/:id", async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) return res.status(403).send("No access");

    const bookingId = req.params.id;

    const [rows] = await db.query(
      "SELECT id, user_id, status FROM bookings WHERE id = ?",
      [bookingId]
    );

    const booking = rows?.[0];
    if (!booking) return res.send("Booking not found");
    if (Number(booking.user_id) !== Number(userId)) return res.status(403).send("No access");

    if (booking.status !== "pending" && booking.status !== "approved") {
      return res.send("Booking cannot be cancelled");
    }

    await db.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [bookingId]);

    res.redirect("/my-bookings");
  } catch (err) {
    res.send(String(err.message || err));
  }
});

// ================= ADMIN CANCEL BOOKING =================
router.post("/admin/cancel/:id", async (req, res) => {
  try {
    if (req.session?.user?.role !== "admin") return res.status(403).send("No access");

    const bookingId = req.params.id;
    const [rows] = await db.query(
      "SELECT id FROM bookings WHERE id = ?",
      [bookingId]
    );

    if (!rows?.length) return res.send("Booking not found");

    await db.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [bookingId]);
    res.redirect("/admin");
  } catch (err) {
    res.send(String(err.message || err));
  }
});

module.exports = router;


