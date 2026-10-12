const express = require("express");

const Flight = require("../models/Flight");

const router = express.Router();

// GET ALL FLIGHTS
router.get("/", async (req, res) => {
  try {
    const flights = await Flight.find().sort({
      createdAt: -1,
    });

    res.json(flights);
  } catch (error) {
    console.error("Get flights error:", error);

    res.status(500).json({
      message: "Failed to fetch flights",
    });
  }
});

// GET SINGLE FLIGHT
router.get("/:id", async (req, res) => {
  try {
    const flight = await Flight.findById(
      req.params.id
    );

    if (!flight) {
      return res.status(404).json({
        message: "Flight not found",
      });
    }

    res.json(flight);
  } catch (error) {
    console.error("Get flight error:", error);

    res.status(500).json({
      message: "Failed to fetch flight",
    });
  }
});

// ADD NEW FLIGHT
router.post("/", async (req, res) => {
  try {
    const {
      flightNo,
      airline,
      departure,
      destination,
      departureTime,
      arrivalTime,
      totalSeats,
      availableSeats,
      status,
      statusType,
    } = req.body;

    if (
      !flightNo ||
      !airline ||
      !departure ||
      !destination ||
      !departureTime ||
      !arrivalTime ||
      totalSeats === undefined
    ) {
      return res.status(400).json({
        message: "Please fill all required flight details",
      });
    }

    const existingFlight = await Flight.findOne({
      flightNo: flightNo.trim().toUpperCase(),
    });

    if (existingFlight) {
      return res.status(400).json({
        message: "Flight number already exists",
      });
    }

    const flight = await Flight.create({
      flightNo: flightNo.trim().toUpperCase(),
      airline: airline.trim(),
      departure: departure.trim().toUpperCase(),
      destination: destination.trim().toUpperCase(),
      departureTime,
      arrivalTime,
      totalSeats: Number(totalSeats),
      availableSeats:
        availableSeats !== undefined
          ? Number(availableSeats)
          : Number(totalSeats),
      status: status || "On Time",
      statusType: statusType || "active",
    });

    res.status(201).json({
      message: "Flight added successfully",
      flight,
    });
  } catch (error) {
    console.error("Add flight error:", error);

    res.status(500).json({
      message: "Failed to add flight",
    });
  }
});

// UPDATE FLIGHT
router.put("/:id", async (req, res) => {
  try {
    const {
      airline,
      departure,
      destination,
      departureTime,
      arrivalTime,
      totalSeats,
      availableSeats,
      status,
      statusType,
    } = req.body;

    const flight = await Flight.findById(
      req.params.id
    );

    if (!flight) {
      return res.status(404).json({
        message: "Flight not found",
      });
    }

    if (airline !== undefined)
      flight.airline = airline.trim();

    if (departure !== undefined)
      flight.departure = departure.trim().toUpperCase();

    if (destination !== undefined)
      flight.destination =
        destination.trim().toUpperCase();

    if (departureTime !== undefined)
      flight.departureTime = departureTime;

    if (arrivalTime !== undefined)
      flight.arrivalTime = arrivalTime;

    if (totalSeats !== undefined)
      flight.totalSeats = Number(totalSeats);

    if (availableSeats !== undefined)
      flight.availableSeats = Number(availableSeats);

    if (status !== undefined)
      flight.status = status;

    if (statusType !== undefined)
      flight.statusType = statusType;

    await flight.save();

    res.json({
      message: "Flight updated successfully",
      flight,
    });
  } catch (error) {
    console.error("Update flight error:", error);

    res.status(500).json({
      message: "Failed to update flight",
    });
  }
});

const mongoose = require("mongoose");

// DELETE FLIGHT
router.delete("/:id", async (req, res) => {
  try {
    const param = req.params.id;

    let flight = null;

    if (mongoose.Types.ObjectId.isValid(param)) {
      flight = await Flight.findById(param);
    }

    if (!flight) {
      flight = await Flight.findOne({
        flightNo: param.toUpperCase().trim(),
      });
    }

    if (flight) {
      await Flight.findByIdAndDelete(flight._id);
    }

    res.json({
      message: "Flight deleted successfully",
    });
  } catch (error) {
    console.error("Delete flight error:", error);

    res.status(500).json({
      message: "Failed to delete flight",
    });
  }
});

module.exports = router;