const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const flightRoutes = require("./routes/flightRoutes");
const rebookingRoutes = require("./routes/rebookingRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// HOME / SERVER TEST
app.get("/", (req, res) => {
  res.json({
    message:
      "Emergency Flight Rebooking Backend is running",
  });
});

// AUTH ROUTES
app.use("/api/auth", authRoutes);

// FLIGHT ROUTES
app.use("/api/flights", flightRoutes);

// REBOOKING ROUTES
app.use("/api/rebooking-requests", rebookingRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});