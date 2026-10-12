const express = require("express");
const mongoose = require("mongoose");
const RebookingRequest = require("../models/RebookingRequest");
const RebookingAdminRequest = require("../models/RebookingAdminRequest");
const RebookingResponse = require("../models/RebookingResponse");

const router = express.Router();

// Helper to format combined request & response data
const formatCombinedRequest = (requestDoc, responseDoc) => {
  const reqObj = requestDoc.toObject ? requestDoc.toObject() : requestDoc;
  const respObj = responseDoc ? (responseDoc.toObject ? responseDoc.toObject() : responseDoc) : {};

  return {
    ...reqObj,
    status: respObj.status || "Pending",
    adminMessage: respObj.adminMessage || "",
    responseUpdatedAt: respObj.updatedAt || null,
  };
};

// =========================================================
// CREATE REBOOKING REQUEST
// POST /api/rebooking-requests
// Stores user request in 'rebookingrequest', admin inbox in 'rebookingadminrequest',
// and initial status in 'rebookingresponse'
// =========================================================
router.post("/", async (req, res) => {
  try {
    const {
      pnr,
      passengerName,
      email,
      currentFlight,
      requestedFlight,
      requestedSeat,
      route,
      reason,
      message,
    } = req.body;

    // Validate required fields
    if (
      !pnr ||
      !passengerName ||
      !email ||
      !currentFlight ||
      !requestedFlight ||
      !requestedSeat ||
      !route ||
      !reason
    ) {
      return res.status(400).json({
        message: "Please fill all required rebooking details",
      });
    }

    // Generate request ID
    const requestId = `REQ-${Date.now()}`;

    const requestPayload = {
      requestId,
      pnr: pnr.trim().toUpperCase(),
      passengerName: passengerName.trim(),
      email: email.trim().toLowerCase(),
      currentFlight: currentFlight.trim().toUpperCase(),
      requestedFlight: requestedFlight.trim().toUpperCase(),
      requestedSeat: requestedSeat.trim(),
      route: route.trim(),
      reason: reason.trim(),
      message: message ? message.trim() : "",
    };

    // 1. Create user request in 'rebookingrequest' collection
    const userRequest = await RebookingRequest.create(requestPayload);

    // 2. Create admin request entry in 'rebookingadminrequest' collection
    await RebookingAdminRequest.create(requestPayload);

    // 3. Create initial admin response in 'rebookingresponse' collection
    const response = await RebookingResponse.create({
      requestId,
      status: "Pending",
      adminMessage: "",
    });

    res.status(201).json({
      message: "Rebooking request submitted successfully",
      request: formatCombinedRequest(userRequest, response),
    });
  } catch (error) {
    console.error("Create rebooking request error:", error);
    res.status(500).json({
      message: "Failed to submit rebooking request",
    });
  }
});

// =========================================================
// GET ALL REBOOKING REQUESTS FOR ADMIN
// GET /api/rebooking-requests
// Fetches from 'rebookingadminrequest' collection & joins 'rebookingresponse'
// =========================================================
router.get("/", async (req, res) => {
  try {
    // Fetch requests from admin collection 'rebookingadminrequest'
    let adminRequests = await RebookingAdminRequest.find().sort({ createdAt: -1 });

    // Fallback to user collection if admin collection is empty
    if (adminRequests.length === 0) {
      adminRequests = await RebookingRequest.find().sort({ createdAt: -1 });
    }

    const requestIds = adminRequests.map((r) => r.requestId);
    const responses = await RebookingResponse.find({ requestId: { $in: requestIds } });

    const responseMap = {};
    responses.forEach((resp) => {
      responseMap[resp.requestId] = resp;
    });

    const combinedList = adminRequests.map((reqDoc) =>
      formatCombinedRequest(reqDoc, responseMap[reqDoc.requestId])
    );

    res.json(combinedList);
  } catch (error) {
    console.error("Get admin rebooking requests error:", error);
    res.status(500).json({
      message: "Failed to fetch rebooking requests",
    });
  }
});

// =========================================================
// GET PASSENGER REQUESTS BY EMAIL
// GET /api/rebooking-requests/passenger/:email
// Fetches from 'rebookingrequest' collection & joins 'rebookingresponse'
// =========================================================
router.get("/passenger/:email", async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();

    const requests = await RebookingRequest.find({ email }).sort({ createdAt: -1 });

    const requestIds = requests.map((r) => r.requestId);
    const responses = await RebookingResponse.find({ requestId: { $in: requestIds } });

    const responseMap = {};
    responses.forEach((resp) => {
      responseMap[resp.requestId] = resp;
    });

    const combinedList = requests.map((reqDoc) =>
      formatCombinedRequest(reqDoc, responseMap[reqDoc.requestId])
    );

    res.json(combinedList);
  } catch (error) {
    console.error("Get passenger rebooking requests error:", error);
    res.status(500).json({
      message: "Failed to fetch passenger requests",
    });
  }
});

// =========================================================
// GET SINGLE REBOOKING REQUEST
// GET /api/rebooking-requests/:id
// =========================================================
router.get("/:id", async (req, res) => {
  try {
    const param = req.params.id;

    let request = null;
    if (mongoose.Types.ObjectId.isValid(param)) {
      request = await RebookingAdminRequest.findById(param);
      if (!request) {
        request = await RebookingRequest.findById(param);
      }
    }
    if (!request) {
      request = await RebookingAdminRequest.findOne({ requestId: param });
    }
    if (!request) {
      request = await RebookingRequest.findOne({ requestId: param });
    }

    if (!request) {
      return res.status(404).json({
        message: "Rebooking request not found",
      });
    }

    const response = await RebookingResponse.findOne({ requestId: request.requestId });

    res.json(formatCombinedRequest(request, response));
  } catch (error) {
    console.error("Get single rebooking request error:", error);
    res.status(500).json({
      message: "Failed to fetch rebooking request",
    });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const { status, adminMessage } = req.body;
    const param = req.params.id;

    // Validate status
    const allowedStatuses = ["Pending", "Processing", "Approved", "Rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid request status",
      });
    }

    let request = null;
    if (mongoose.Types.ObjectId.isValid(param)) {
      request = await RebookingAdminRequest.findById(param);
      if (!request) request = await RebookingRequest.findById(param);
    }
    if (!request) {
      request = await RebookingAdminRequest.findOne({ requestId: param });
      if (!request) request = await RebookingRequest.findOne({ requestId: param });
    }

    if (!request) {
      return res.status(404).json({
        message: "Rebooking request not found",
      });
    }

    const updateData = { status };
    if (adminMessage !== undefined) {
      updateData.adminMessage = adminMessage.trim();
    }

    const response = await RebookingResponse.findOneAndUpdate(
      { requestId: request.requestId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({
      message: "Rebooking response status updated successfully",
      request: formatCombinedRequest(request, response),
    });
  } catch (error) {
    console.error("Update rebooking request status error:", error);
    res.status(500).json({
      message: "Failed to update request status",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const param = req.params.id;

    let request = null;
    if (mongoose.Types.ObjectId.isValid(param)) {
      request = await RebookingAdminRequest.findById(param);
      if (!request) request = await RebookingRequest.findById(param);
    }
    if (!request) {
      request = await RebookingAdminRequest.findOne({ requestId: param });
      if (!request) request = await RebookingRequest.findOne({ requestId: param });
    }

    if (!request) {
      return res.status(404).json({
        message: "Rebooking request not found",
      });
    }

    // Delete from all 3 collections
    await RebookingRequest.deleteOne({ requestId: request.requestId });
    await RebookingAdminRequest.deleteOne({ requestId: request.requestId });
    await RebookingResponse.deleteOne({ requestId: request.requestId });

    res.json({
      message: "Rebooking request deleted successfully across all collections",
    });
  } catch (error) {
    console.error("Delete rebooking request error:", error);
    res.status(500).json({
      message: "Failed to delete rebooking request",
    });
  }
});

module.exports = router;