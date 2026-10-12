const mongoose = require("mongoose");

const rebookingResponseSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Approved", "Rejected"],
      default: "Pending",
    },
    adminMessage: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "rebookingresponse",
  }
);

module.exports = mongoose.model(
  "RebookingResponse",
  rebookingResponseSchema,
  "rebookingresponse"
);
