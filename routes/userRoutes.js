const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/db");

// ================= REGISTER =================
router.post("/register", async (req, res) => {

    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
        return res.send("All fields are required");
    }

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, result) => {

            if (err) return res.send(err);

            if (result.length > 0) {
                return res.send("Email already exists");
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            db.query(
                `
                INSERT INTO users (fullname, email, password)
                VALUES (?, ?, ?)
                `,
                [fullname, email, hashedPassword],
                (err2) => {

                    if (err2) return res.send(err2);

                    res.redirect("/login");
                }
            );
        }
    );
});

// ================= LOGIN =================
router.post("/login", (req, res) => {

    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, result) => {

            if (err) return res.send(err);

            if (result.length === 0) {
                return res.send("User not found");
            }

            const user = result[0];

            const validPassword = await bcrypt.compare(
                password,
                user.password
            );

            if (!validPassword) {
                return res.send("Incorrect password");
            }

            req.session.user = {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role
            };

            // ADMIN REDIRECT
            if (user.role === "admin") {
                return res.redirect("/admin");
            }

            // USER REDIRECT
            res.redirect("/vehicles");
        }
    );
});

module.exports = router;