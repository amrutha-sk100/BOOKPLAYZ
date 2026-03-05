const express = require("express");
const db = require("../config/db");

const router = express.Router();

// GET ALL TURFS
router.get("/", (req, res) => {
    const sql = "SELECT * FROM turfs";

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// GET SINGLE TURF
router.get("/:id", (req, res) => {
    const sql = "SELECT * FROM turfs WHERE id = ?";
    
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result[0]);
    });
});


// GET AVAILABLE SLOTS BY DATE
router.get("/:id/slots", (req, res) => {
    const { date } = req.query;

    const sql = `
        SELECT id, start_time, end_time, slot_status
        FROM time_slots
        WHERE turf_id = ? AND date = ?
        ORDER BY start_time
    `;

    db.query(sql, [req.params.id, date], (err, result) => {
        if (err) return res.status(500).json(err);

        res.json({
            turf_id: req.params.id,
            date,
            slots: result
        });
    });
});

module.exports = router;