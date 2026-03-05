const express = require("express");
const db = require("../config/db");

const router = express.Router();

// CREATE BOOKING (Before Payment)
router.post("/", (req, res) => {
    const { user_id, turf_id, slot_id, amount } = req.body;

    // check slot available
    const checkSql = "SELECT * FROM time_slots WHERE id = ? AND is_booked = false";

    db.query(checkSql, [slot_id], (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.length === 0) {
            return res.status(400).json({ error: "Slot already booked" });
        }

        const sql = `
            INSERT INTO bookings (user_id, turf_id, slot_id, amount)
            VALUES (?, ?, ?, ?)
        `;

        db.query(sql, [user_id, turf_id, slot_id, amount], (err, result) => {
            if (err) return res.status(500).json(err);

            res.json({
                message: "Booking created",
                booking_id: result.insertId
            });
        });
    });
});

// HOLD SLOT (5 MIN LOCK)
router.post("/hold", (req, res) => {
    const { slot_id } = req.body;

    const sql = `
        UPDATE time_slots
        SET slot_status = 'held'
        WHERE id = ? AND slot_status = 'available'
    `;

    db.query(sql, [slot_id], (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: "Slot not available" });
        }

        res.json({ message: "Slot held for 5 minutes" });
    });
});

setTimeout(() => {
    db.query(`
        UPDATE time_slots
        SET slot_status = 'available'
        WHERE id = ? AND slot_status = 'held'
    `, [slot_id]);
}, 5 * 60 * 1000);

module.exports = router;