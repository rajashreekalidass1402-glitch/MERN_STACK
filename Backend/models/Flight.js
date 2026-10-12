const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema(
  {
    flightNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    airline: {
      type: String,
      required: true,
      trim: true,
    },

    departure: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    departureTime: {
      type: String,
      required: true,
    },

    arrivalTime: {
      type: String,
      required: true,
    },

    totalSeats: {
      type: Number,
      required: true,
      min: 0,
    },

    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "On Time",
        "DELAYED",
        "CANCELLED",
      ],
      default: "On Time",
    },

    statusType: {
      type: String,
      enum: [
        "active",
        "processing",
        "danger",
      ],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Flight", flightSchema);