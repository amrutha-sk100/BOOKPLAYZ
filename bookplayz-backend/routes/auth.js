const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    const { name, email, phone, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)";
        db.query(sql, [name, email, phone, hashedPassword], (err, result) => {
            if (err) {
                return res.status(400).json({ error: "User already exists" });
            }
            res.json({ message: "User registered successfully ✅" });
        });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// LOGIN
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, result) => {
        if (err || result.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        const user = result[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful ✅",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    });
});

module.exports = router;