const mongoose = require("mongoose");

const rebookingAdminRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    pnr: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    passengerName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    currentFlight: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    requestedFlight: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    requestedSeat: {
      type: String,
      required: true,
      trim: true,
    },
    route: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "rebookingadminrequest",
  }
);

module.exports = mongoose.model(
  "RebookingAdminRequest",
  rebookingAdminRequestSchema,
  "rebookingadminrequest"
);
