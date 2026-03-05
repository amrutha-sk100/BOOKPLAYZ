const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const db = require("../config/db");

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
});

// CREATE ORDER
router.post("/create-order", async (req, res) => {
    const { amount } = req.body;

    const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: "receipt_order"
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
});

// VERIFY PAYMENT
router.post("/verify", (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id, slot_id } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body)
        .digest("hex");

    if (expectedSignature === razorpay_signature) {

        db.query("UPDATE bookings SET status='confirmed', payment_status='paid' WHERE id=?", [booking_id]);

        db.query("UPDATE time_slots SET is_booked=booked WHERE id=?", [slot_id]);

        res.json({ message: "Payment verified ✅" });

    } else {
        res.status(400).json({ error: "Payment verification failed" });
    }
});

module.exports = router;