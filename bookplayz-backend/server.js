const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/db");

const authRoutes = require("./routes/auth");

const turfRoutes = require("./routes/turf");

const bookingRoutes = require("./routes/booking");

const paymentRoutes = require("./routes/payment");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/turfs", turfRoutes);


app.use("/api/bookings", bookingRoutes);

app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
    res.send("BookPlayz Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});