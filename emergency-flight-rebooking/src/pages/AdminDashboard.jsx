import { useState, useEffect } from "react";
import "./Dashboard.css";

import {
  PlaneIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  UserIcon,
  SearchIcon,
  PlusIcon,
  XIcon,
  GridIcon,
  InboxIcon,
  ListIcon,
  EditIcon,
  TrashIcon,
  LogOutIcon,
  ShieldIcon,
  RefreshCwIcon,
} from "../components/Icons";

function AdminDashboard({ onLogout }) {
  // =========================================================
  // ACTIVE SIDEBAR TAB
  // =========================================================
  const [activeTab, setActiveTab] = useState("overview");

  // =========================================================
  // DEFAULT DATA
  // =========================================================
  const defaultFlights = [
    {
      id: 1,
      flightNo: "SR204",
      airline: "SkyRebook Express",
      from: "MAA",
      fromCity: "Chennai",
      to: "DEL",
      toCity: "Delhi",
      date: "05 Oct 2026",
      departure: "10:30 AM",
      arrival: "01:15 PM",
      seats: 42,
      status: "On Time",
      statusType: "active",
    },
    {
      id: 2,
      flightNo: "AI402",
      airline: "Air India Express",
      from: "BOM",
      fromCity: "Mumbai",
      to: "BLR",
      toCity: "Bangalore",
      date: "03 Oct 2026",
      departure: "02:15 PM",
      arrival: "04:00 PM",
      seats: 0,
      status: "CANCELLED",
      statusType: "danger",
    },
    {
      id: 3,
      flightNo: "6E105",
      airline: "IndiGo Alliance",
      from: "DEL",
      fromCity: "Delhi",
      to: "HYD",
      toCity: "Hyderabad",
      date: "03 Oct 2026",
      departure: "04:45 PM",
      arrival: "07:00 PM",
      seats: 18,
      status: "DELAYED 90M",
      statusType: "processing",
    },
    {
      id: 4,
      flightNo: "SR305",
      airline: "SkyRebook Express",
      from: "DEL",
      fromCity: "Delhi",
      to: "BLR",
      toCity: "Bangalore",
      date: "03 Oct 2026",
      departure: "06:15 PM",
      arrival: "08:45 PM",
      seats: 27,
      status: "On Time",
      statusType: "active",
    },
    {
      id: 5,
      flightNo: "IX-772",
      airline: "Air India Express",
      from: "BOM",
      fromCity: "Mumbai",
      to: "BLR",
      toCity: "Bangalore",
      date: "03 Oct 2026",
      departure: "07:30 PM",
      arrival: "09:15 PM",
      seats: 8,
      status: "On Time",
      statusType: "active",
    },
  ];

  const defaultRequests = [
    {
      id: "REQ-101",
      pnr: "SRBK-8842",
      passengerName: "Gokul Kumar",
      passenger: "Gokul Kumar",
      email: "passenger@example.com",
      currentFlight: "AI402",
      requestedFlight: "SR305",
      route: "Mumbai → Bangalore",
      reason: "Flight Cancelled",
      message: "Flight AI402 cancelled due to fog",
      date: "03 Oct 2026",
      status: "Pending",
      adminMessage: "Your request is currently being reviewed.",
      avatar: "GK",
    },
    {
      id: "REQ-102",
      pnr: "SRBK-9912",
      passengerName: "Ananya Priya",
      passenger: "Ananya Priya",
      email: "ananya@example.com",
      currentFlight: "6E105",
      requestedFlight: "6E-441",
      route: "Delhi → Hyderabad",
      reason: "Missed Connection",
      message: "Delayed 90m - Missed Connection",
      date: "03 Oct 2026",
      status: "Processing",
      adminMessage: "Your request is being processed by the operations team.",
      avatar: "AP",
    },
    {
      id: "REQ-103",
      pnr: "SRBK-3341",
      passengerName: "Rahul Kumar",
      passenger: "Rahul Kumar",
      email: "rahul@example.com",
      currentFlight: "SR204",
      requestedFlight: "SR305",
      route: "Chennai → Delhi",
      reason: "Emergency Schedule Change",
      message: "Personal schedule emergency",
      date: "02 Oct 2026",
      status: "Approved",
      adminMessage: "Approved for priority transfer on SR305.",
      avatar: "RK",
    },
  ];

  // =========================================================
  // STATE
  // =========================================================
  const [flights, setFlights] = useState([]);
  const [flightsLoading, setFlightsLoading] = useState(true);

  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem("skyrebookRequests");
    try {
      return saved ? JSON.parse(saved) : defaultRequests;
    } catch {
      return defaultRequests;
    }
  });

  // =========================================================
  // MONGODB FLIGHT HELPERS
  // =========================================================
  const normalizeFlight = (flight) => ({
    ...flight,
    id: flight._id || flight.id,
    flightNo: flight.flightNo || "",
    airline: flight.airline || "",
    from: flight.departure || flight.from || "",
    to: flight.destination || flight.to || "",
    fromCity: flight.fromCity || flight.departure || "",
    toCity: flight.toCity || flight.destination || "",
    departure: flight.departureTime || flight.departure || "",
    arrival: flight.arrivalTime || flight.arrival || "TBD",
    seats:
      flight.availableSeats !== undefined
        ? Number(flight.availableSeats)
        : Number(flight.seats || 0),
    totalSeats:
      flight.totalSeats !== undefined
        ? Number(flight.totalSeats)
        : Number(flight.seats || 0),
    status: flight.status || "On Time",
    statusType: flight.statusType || "active",
  });

  const getStatusType = (status) => {
    const value = String(status || "").toLowerCase();

    if (value.includes("cancelled")) return "danger";
    if (value.includes("delayed")) return "processing";

    return "active";
  };

  const normalizeRequest = (req) => ({
    ...req,
    id: req._id || req.requestId || req.id,
    requestId: req.requestId || req.id || req._id,
    pnr: req.pnr || "SRBK-8842",
    passengerName: req.passengerName || req.passenger || "Passenger",
    passenger: req.passengerName || req.passenger || "Passenger",
    email: req.email || "",
    currentFlight: req.currentFlight || "AI402",
    requestedFlight: req.requestedFlight || "SR305",
    route: req.route || "Origin → Destination",
    reason: req.reason || "Rebooking Request",
    message: req.message || "",
    date: req.date || "04 Oct 2026",
    status: req.status || "Pending",
    adminMessage: req.adminMessage || "",
    avatar: (req.passengerName || req.passenger || "PA").substring(0, 2).toUpperCase(),
  });

  const fetchFlights = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/flights");
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setFlights(data.map(normalizeFlight));
      }
    } catch (error) {
      console.error("Fetch flights error:", error);
    } finally {
      setFlightsLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/rebooking-requests");
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setRequests(data.map(normalizeRequest));
        }
      }
    } catch (error) {
      console.error("Fetch requests error:", error);
    }
  };

  useEffect(() => {
    fetchFlights();
    fetchRequests();

    const interval = setInterval(() => {
      fetchFlights();
      fetchRequests();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // =========================================================
  // TOAST
  // =========================================================
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // =========================================================
  // FILTERS & SEARCH
  // =========================================================
  const [requestSearch, setRequestSearch] = useState("");
  const [requestFilter, setRequestFilter] = useState("All");

  const [flightSearch, setFlightSearch] = useState("");
  const [flightFilter, setFlightFilter] = useState("All");

  // Add Flight Form State
  const [addForm, setAddForm] = useState({
    flightNo: "",
    airline: "SkyRebook Express",
    fromCity: "MAA (Chennai)",
    toCity: "DEL (Delhi)",
    departure: "",
    arrival: "",
    seats: "45",
    status: "On Time",
  });

  // Edit Flight Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [newStatus, setNewStatus] = useState("On Time");
  const [newSeats, setNewSeats] = useState(30);

  // Edit Request Response Modal / Direct Message Update
  const [editingRequestMsg, setEditingRequestMsg] = useState(null);
  const [adminResponseText, setAdminResponseText] = useState("");

  // =========================================================
  // UPDATE REQUEST STATUS & REDUCE SEAT CAPACITY ON APPROVAL
  // =========================================================
  const handleUpdateReqStatus = async (reqId, newStatusVal, customMsg = null) => {
    const targetReq = requests.find((r) => r.id === reqId);
    if (!targetReq) return;

    let messageToSave = customMsg;
    if (messageToSave === null) {
      if (newStatusVal === "Approved") {
        messageToSave = `Your rebooking request has been approved for ${targetReq.requestedFlight || "alternative flight"}. Digital boarding pass is now generated.`;
      } else if (newStatusVal === "Processing") {
        messageToSave = "Your request is currently being processed by the SkyRebook operations team.";
      } else if (newStatusVal === "Rejected") {
        messageToSave = "Rebooking request rejected due to seat capacity or policy constraint.";
      } else {
        messageToSave = "Your request is currently under review.";
      }
    }

    // Decrement available seats in MongoDB when Admin approves
    if (newStatusVal === "Approved" && targetReq.status !== "Approved") {
      const requestedFlightNo = targetReq.requestedFlight;

      if (requestedFlightNo) {
        const targetFlight = flights.find(
          (flight) =>
            flight.flightNo.toLowerCase() ===
            requestedFlightNo.toLowerCase()
        );

        if (targetFlight) {
          const currentSeats = Number(targetFlight.seats || 0);
          const updatedSeats = Math.max(0, currentSeats - 1);
          const updatedStatus =
            updatedSeats === 0 ? "FULL" : targetFlight.status;
          const updatedStatusType =
            updatedSeats === 0 ? "danger" : targetFlight.statusType;

          try {
            const response = await fetch(
              `http://localhost:5000/api/flights/${targetFlight.id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  availableSeats: updatedSeats,
                  status: updatedStatus,
                  statusType: updatedStatusType,
                }),
              }
            );

            const data = await response.json();

            if (response.ok) {
              const updatedFlight = normalizeFlight(data.flight);

              setFlights((prev) =>
                prev.map((flight) =>
                  flight.id === targetFlight.id
                    ? {
                        ...updatedFlight,
                        fromCity: targetFlight.fromCity,
                        toCity: targetFlight.toCity,
                      }
                    : flight
                )
              );
            } else {
              console.error("Seat update failed:", data.message);
            }
          } catch (error) {
            console.error("Seat update error:", error);
          }
        }
      }
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/rebooking-requests/${encodeURIComponent(
          targetReq._id || targetReq.requestId || reqId
        )}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatusVal,
            adminMessage: messageToSave,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const updatedReq = normalizeRequest(data.request);
        setRequests((prev) =>
          prev.map((request) =>
            request.id === reqId || request.requestId === reqId || request._id === reqId
              ? updatedReq
              : request
          )
        );
      } else {
        setRequests((prev) =>
          prev.map((request) =>
            request.id === reqId
              ? { ...request, status: newStatusVal, adminMessage: messageToSave }
              : request
          )
        );
      }
    } catch (error) {
      console.error("Update request error:", error);
      setRequests((prev) =>
        prev.map((request) =>
          request.id === reqId
            ? { ...request, status: newStatusVal, adminMessage: messageToSave }
            : request
        )
      );
    }

    showToast(`✓ Request ${targetReq.requestId || reqId} updated to status: "${newStatusVal}"`);
  };

  // Delete Request Handler
  const handleDeleteRequest = async (reqId) => {
    const targetReq = requests.find(
      (r) => r.id === reqId || r.requestId === reqId || r._id === reqId
    );
    if (!targetReq) return;

    if (
      window.confirm(
        `Are you sure you want to delete request ${targetReq.requestId || reqId}?`
      )
    ) {
      try {
        await fetch(
          `http://localhost:5000/api/rebooking-requests/${encodeURIComponent(
            targetReq._id || targetReq.requestId || reqId
          )}`,
          {
            method: "DELETE",
          }
        );
      } catch (error) {
        console.error("Delete request error:", error);
      }

      setRequests((prev) =>
        prev.filter(
          (r) => r.id !== reqId && r.requestId !== reqId && r._id !== reqId
        )
      );
      showToast(`✓ Request ${targetReq.requestId || reqId} removed successfully.`);
    }
  };

  const handleSaveAdminMessage = async () => {
    if (!editingRequestMsg) return;

    const reqId = editingRequestMsg.id || editingRequestMsg.requestId || editingRequestMsg._id;

    try {
      const response = await fetch(
        `http://localhost:5000/api/rebooking-requests/${encodeURIComponent(reqId)}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: editingRequestMsg.status || "Pending",
            adminMessage: adminResponseText,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const updatedReq = normalizeRequest(data.request);
        setRequests((prev) =>
          prev.map((req) =>
            req.id === reqId || req.requestId === reqId || req._id === reqId
              ? updatedReq
              : req
          )
        );
      }
    } catch (error) {
      console.error("Save admin message error:", error);
    }

    setEditingRequestMsg(null);
    showToast(`✓ Admin message updated for ${editingRequestMsg.requestId || reqId}`);
  };

  // =========================================================
  // ADD FLIGHT
  // =========================================================
  const handleAddFlightSubmit = async (e) => {
    e.preventDefault();

    if (!addForm.flightNo.trim() || !addForm.departure.trim()) {
      alert("Please fill in Flight Number and Departure Time.");
      return;
    }

    const flightNoUpper = addForm.flightNo.trim().toUpperCase();

    const duplicateFlight = flights.some(
      (flight) => flight.flightNo.toUpperCase() === flightNoUpper
    );

    if (duplicateFlight) {
      alert(`Flight ${flightNoUpper} already exists in the schedule!`);
      return;
    }

    const statusType = getStatusType(addForm.status);

    const fromMatch = addForm.fromCity.match(/^([A-Z]{3})\s*\((.+)\)$/);
    const toMatch = addForm.toCity.match(/^([A-Z]{3})\s*\((.+)\)$/);

    const departureCode = fromMatch ? fromMatch[1] : addForm.fromCity.split(" ")[0];
    const departureCity = fromMatch ? fromMatch[2] : addForm.fromCity;
    const destinationCode = toMatch ? toMatch[1] : addForm.toCity.split(" ")[0];
    const destinationCity = toMatch ? toMatch[2] : addForm.toCity;

    const totalSeats = parseInt(addForm.seats, 10) || 0;

    if (totalSeats <= 0) {
      alert("Please enter a valid seat capacity.");
      return;
    }

    const flightPayload = {
      flightNo: flightNoUpper,
      airline: addForm.airline,
      departure: departureCode,
      destination: destinationCode,
      departureTime: addForm.departure,
      arrivalTime: addForm.arrival || "TBD",
      totalSeats,
      availableSeats: addForm.status.toLowerCase().includes("cancelled")
        ? 0
        : totalSeats,
      status: addForm.status,
      statusType,
    };

    try {
      const response = await fetch("http://localhost:5000/api/flights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(flightPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to add flight.");
        return;
      }

      const savedFlight = normalizeFlight({
        ...data.flight,
        fromCity: departureCity,
        toCity: destinationCity,
      });

      setFlights((prev) => [
        savedFlight,
        ...prev.filter((flight) => flight.flightNo !== savedFlight.flightNo),
      ]);

      showToast(`✈ New Flight ${flightNoUpper} successfully added to MongoDB!`);

      setAddForm({
        flightNo: "",
        airline: "SkyRebook Express",
        fromCity: "MAA (Chennai)",
        toCity: "DEL (Delhi)",
        departure: "",
        arrival: "",
        seats: "45",
        status: "On Time",
      });

      setActiveTab("view-flights");
    } catch (error) {
      console.error("Add flight error:", error);
      alert(
        "Cannot connect to backend. Please make sure the backend is running on port 5000."
      );
    }
  };

  // =========================================================
  // EDIT FLIGHT
  // =========================================================
  const handleOpenEdit = (flight) => {
    setEditingFlight(flight);
    setNewStatus(flight.status);
    setNewSeats(flight.seats);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedFlight = async () => {
    if (!editingFlight) return;

    const statusType = getStatusType(newStatus);
    const availableSeats = Math.max(0, parseInt(newSeats, 10) || 0);

    try {
      const response = await fetch(
        `http://localhost:5000/api/flights/${editingFlight.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            availableSeats,
            status: newStatus,
            statusType,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update flight.");
        return;
      }

      const updatedFlight = normalizeFlight({
        ...data.flight,
        fromCity: editingFlight.fromCity,
        toCity: editingFlight.toCity,
      });

      setFlights((prev) =>
        prev.map((flight) =>
          flight.id === editingFlight.id ? updatedFlight : flight
        )
      );

      setIsEditModalOpen(false);

      showToast(
        `✓ Flight ${editingFlight.flightNo} updated in MongoDB! Status: ${newStatus}`
      );
    } catch (error) {
      console.error("Update flight error:", error);
      alert(
        "Cannot connect to backend. Please make sure the backend is running on port 5000."
      );
    }
  };

  const handleDeleteFlight = async (flightNo) => {
    if (
      !window.confirm(
        `Are you sure you want to remove flight ${flightNo} from schedule?`
      )
    ) {
      return;
    }

    const upperNo = flightNo.toUpperCase();

    const existingDeleted = getDeletedFlightNos();
    if (!existingDeleted.includes(upperNo)) {
      const updatedDeleted = [...existingDeleted, upperNo];
      localStorage.setItem(
        "skyrebookDeletedFlights",
        JSON.stringify(updatedDeleted)
      );
    }

    try {
      await fetch(
        `http://localhost:5000/api/flights/${encodeURIComponent(upperNo)}`,
        {
          method: "DELETE",
        }
      );
    } catch (error) {
      console.error("Delete flight backend error:", error);
    }

    setFlights((prev) =>
      prev.filter((item) => item.flightNo.toUpperCase() !== upperNo)
    );

    showToast(`🗑 Flight ${flightNo} removed from schedule.`);
  };

  // =========================================================
  // FILTERED DATA
  // =========================================================
  const filteredRequests = requests.filter((request) => {
    const matchStatus =
      requestFilter === "All" || request.status === requestFilter;

    const searchText = requestSearch.toLowerCase();
    const name = (request.passengerName || request.passenger || "").toLowerCase();
    const pnr = (request.pnr || "").toLowerCase();
    const curF = (request.currentFlight || "").toLowerCase();
    const reqF = (request.requestedFlight || "").toLowerCase();

    const matchSearch =
      name.includes(searchText) ||
      pnr.includes(searchText) ||
      curF.includes(searchText) ||
      reqF.includes(searchText);

    return matchStatus && matchSearch;
  });

  const filteredFlights = flights.filter((flight) => {
    const matchStatus =
      flightFilter === "All" ||
      (flightFilter === "On Time" && flight.status === "On Time") ||
      (flightFilter === "Cancelled" && flight.status.includes("CANCELLED")) ||
      (flightFilter === "Delayed" && flight.status.includes("DELAYED"));

    const searchText = flightSearch.toLowerCase();
    const matchSearch =
      flight.flightNo.toLowerCase().includes(searchText) ||
      flight.airline.toLowerCase().includes(searchText) ||
      (flight.from && flight.from.toLowerCase().includes(searchText)) ||
      (flight.to && flight.to.toLowerCase().includes(searchText));

    return matchStatus && matchSearch;
  });

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const processingCount = requests.filter((r) => r.status === "Processing").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

  return (
    <div className="admin-layout">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo-icon">
            <PlaneIcon size={22} color="#ffffff" />
          </div>
          <div>
            <h2>SkyRebook</h2>
            <span>Admin Control Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <GridIcon size={18} />
            <span>Dashboard Overview</span>
          </button>

          <button
            className={`nav-item ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            <InboxIcon size={18} />
            <span>Passenger Requests</span>
            {pendingCount > 0 && (
              <span className="nav-badge pending">{pendingCount}</span>
            )}
          </button>

          <button
            className={`nav-item ${activeTab === "add-flight" ? "active" : ""}`}
            onClick={() => setActiveTab("add-flight")}
          >
            <PlusIcon size={18} />
            <span>Add Flight</span>
          </button>

          <button
            className={`nav-item ${activeTab === "view-flights" ? "active" : ""}`}
            onClick={() => setActiveTab("view-flights")}
          >
            <ListIcon size={18} />
            <span>View Flights</span>
            <span className="nav-badge total">{flights.length}</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile-box">
            <div className="admin-avatar">
              <UserIcon size={18} color="#ffffff" />
            </div>
            <div>
              <strong>System Admin</strong>
              <span>Dispatch Controller</span>
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={onLogout}>
            <LogOutIcon size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <main className="admin-main-content">
        {/* HEADER BAR */}
        <header className="main-header-bar">
          <div className="header-title">
            <h1>
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "requests" && "Passenger Rebooking Requests"}
              {activeTab === "add-flight" && "Add New Flight Segment"}
              {activeTab === "view-flights" && "Scheduled Flights Manifest"}
            </h1>
            <p>
              {activeTab === "overview" &&
                "Monitor passenger emergency requests, operational status, and system metrics."}
              {activeTab === "requests" &&
                "Review, process, and approve emergency flight rebooking requests from passengers."}
              {activeTab === "add-flight" &&
                "Insert a new flight schedule into the SkyRebook emergency rebooking database."}
              {activeTab === "view-flights" &&
                "View, manage, edit operational status, or delete flights in real time."}
            </p>
          </div>
        </header>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="tab-pane">
            <div className="stats-grid">
              <div
                className="stat-card"
                onClick={() => setActiveTab("requests")}
                style={{ cursor: "pointer" }}
              >
                <div className="stat-icon orange">
                  <AlertTriangleIcon size={22} color="#f59e0b" />
                </div>
                <div>
                  <span>Pending Requests</span>
                  <h2>{pendingCount}</h2>
                  <small style={{ color: "#64748b", fontSize: "12px" }}>
                    {pendingCount === 1 ? "1 request waiting" : `${pendingCount} requests waiting`}
                  </small>
                </div>
              </div>

              <div
                className="stat-card"
                onClick={() => setActiveTab("requests")}
                style={{ cursor: "pointer" }}
              >
                <div className="stat-icon blue">
                  <InboxIcon size={22} color="#2563eb" />
                </div>
                <div>
                  <span>In Processing</span>
                  <h2>{processingCount}</h2>
                  <small style={{ color: "#64748b", fontSize: "12px" }}>
                    {processingCount === 1 ? "1 request processing" : `${processingCount} requests processing`}
                  </small>
                </div>
              </div>

              <div
                className="stat-card"
                onClick={() => setActiveTab("requests")}
                style={{ cursor: "pointer" }}
              >
                <div className="stat-icon green">
                  <CheckCircleIcon size={22} color="#10b981" />
                </div>
                <div>
                  <span>Approved Requests</span>
                  <h2>{approvedCount}</h2>
                  <small style={{ color: "#64748b", fontSize: "12px" }}>
                    Successfully rebooked
                  </small>
                </div>
              </div>

              <div
                className="stat-card"
                onClick={() => setActiveTab("view-flights")}
                style={{ cursor: "pointer" }}
              >
                <div className="stat-icon purple">
                  <PlaneIcon size={22} color="#8b5cf6" />
                </div>
                <div>
                  <span>Total Scheduled Flights</span>
                  <h2>{flights.length}</h2>
                  <small style={{ color: "#64748b", fontSize: "12px" }}>
                    Flights in system
                  </small>
                </div>
              </div>
            </div>

            <div className="overview-actions-grid">
              <div
                className="dashboard-card action-banner-card"
                onClick={() => setActiveTab("add-flight")}
              >
                <div className="card-banner-icon blue">
                  <PlusIcon size={24} color="#2563eb" />
                </div>
                <div>
                  <h3>Add New Flight</h3>
                  <p>Add new flight route and seat capacity for emergency transfers</p>
                </div>
                <span className="card-arrow">→</span>
              </div>

              <div
                className="dashboard-card action-banner-card"
                onClick={() => setActiveTab("requests")}
              >
                <div className="card-banner-icon orange">
                  <InboxIcon size={24} color="#f59e0b" />
                </div>
                <div>
                  <h3>Process Requests ({pendingCount} Pending)</h3>
                  <p>Review and assign alternative seats for disrupted passengers</p>
                </div>
                <span className="card-arrow">→</span>
              </div>
            </div>

            {/* RECENT PASSENGER REQUESTS TABLE */}
            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h3>Recent Passenger Rebooking Requests</h3>
                  <p>Showing latest passenger emergency submissions</p>
                </div>
                <button
                  className="view-all-btn"
                  onClick={() => setActiveTab("requests")}
                >
                  View All Requests ({requests.length}) →
                </button>
              </div>

              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>PASSENGER</th>
                      <th>PNR REF</th>
                      <th>CURRENT FLIGHT</th>
                      <th>REQUESTED REBOOK</th>
                      <th>ROUTE</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.slice(0, 5).map((request) => (
                      <tr key={request.id}>
                        <td>
                          <div className="user-cell">
                            <div className="mini-avatar">
                              {request.avatar ||
                                (request.passengerName || request.passenger || "PA")
                                  .substring(0, 2)
                                  .toUpperCase()}
                            </div>
                            <div>
                              <strong>
                                {request.passengerName || request.passenger}
                              </strong>
                              <span>{request.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong className="code-pnr">{request.pnr}</strong>
                        </td>
                        <td>
                          <span className="flight-tag danger">
                            {request.currentFlight}
                          </span>
                        </td>
                        <td>
                          <span className="flight-tag success">
                            {request.requestedFlight}
                          </span>
                        </td>
                        <td>{request.route}</td>
                        <td>
                          <span
                            className={`status-pill ${request.status.toLowerCase()}`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td>
                          {request.status === "Pending" ? (
                            <button
                              className="btn-table-action approve"
                              onClick={() =>
                                handleUpdateReqStatus(request.id, "Approved")
                              }
                            >
                              Approve →
                            </button>
                          ) : (
                            <span className="action-done">Synced</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PASSENGER REQUESTS TAB */}
        {activeTab === "requests" && (
          <div className="tab-pane">
            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h3>Passenger Emergency Rebooking Queue</h3>
                  <p>
                    Filter by status and process passenger rebooking requests instantly
                  </p>
                </div>
                <div className="filter-pills">
                  {["All", "Pending", "Processing", "Approved", "Rejected"].map(
                    (status) => (
                      <button
                        key={status}
                        className={`filter-btn ${
                          requestFilter === status ? "active" : ""
                        }`}
                        onClick={() => setRequestFilter(status)}
                      >
                        {status}
                        {status === "Pending" && ` (${pendingCount})`}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="search-bar-inline">
                <SearchIcon size={16} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search passenger name, PNR code, or flight number..."
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                />
              </div>

              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>PASSENGER & PNR</th>
                      <th>DISRUPTED FLIGHT</th>
                      <th>REQUESTED FLIGHT</th>
                      <th>REASON & DATE</th>
                      <th>STATUS & ADMIN MESSAGE</th>
                      <th>ADMIN ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="no-data-cell">
                          No requests found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((request) => (
                        <tr key={request.id}>
                          <td>
                            <div className="user-cell">
                              <div className="mini-avatar">
                                {request.avatar ||
                                  (request.passengerName || request.passenger || "PA")
                                    .substring(0, 2)
                                    .toUpperCase()}
                              </div>
                              <div>
                                <strong>
                                  {request.passengerName || request.passenger}
                                </strong>
                                <span className="pnr-sub">PNR: {request.pnr}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <strong className="flight-code-badge danger">
                              {request.currentFlight}
                            </strong>
                          </td>
                          <td>
                            <strong className="flight-code-badge success">
                              {request.requestedFlight}
                            </strong>
                          </td>
                          <td>
                            <div className="reason-cell">
                              <span>{request.reason}</span>
                              <small>{request.date}</small>
                            </div>
                          </td>
                          <td>
                            <div className="status-admin-col">
                              <span
                                className={`status-pill ${request.status.toLowerCase()}`}
                              >
                                {request.status}
                              </span>
                              {request.adminMessage && (
                                <small className="admin-msg-hint">
                                  "{request.adminMessage}"
                                </small>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="action-buttons-group">
                              {request.status !== "Approved" && (
                                <button
                                  className="btn-act approve"
                                  onClick={() =>
                                    handleUpdateReqStatus(request.id, "Approved")
                                  }
                                >
                                  Approve
                                </button>
                              )}

                              {request.status !== "Processing" &&
                                request.status !== "Approved" && (
                                  <button
                                    className="btn-act process"
                                    onClick={() =>
                                      handleUpdateReqStatus(request.id, "Processing")
                                    }
                                  >
                                    Process
                                  </button>
                                )}

                              {request.status !== "Rejected" && (
                                <button
                                  className="btn-act reject"
                                  onClick={() =>
                                    handleUpdateReqStatus(request.id, "Rejected")
                                  }
                                >
                                  Reject
                                </button>
                              )}

                              <button
                                className="btn-act edit-msg"
                                onClick={() => {
                                  setEditingRequestMsg(request);
                                  setAdminResponseText(
                                    request.adminMessage || ""
                                  );
                                }}
                              >
                                Edit Msg
                              </button>

                              <button
                                className="btn-act delete"
                                onClick={() => handleDeleteRequest(request.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ADD FLIGHT TAB */}
        {activeTab === "add-flight" && (
          <div className="tab-pane">
            <div className="dashboard-card form-card-container">
              <div className="card-header">
                <div>
                  <h3>Add New Flight to System Schedule</h3>
                  <p>
                    Fill in the operational flight details below to make it available for passenger emergency rebooking.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddFlightSubmit} className="add-flight-form">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>FLIGHT NUMBER *</label>
                    <input
                      type="text"
                      placeholder="e.g. SR-404, AI-880, 6E-210"
                      value={addForm.flightNo}
                      onChange={(e) =>
                        setAddForm({ ...addForm, flightNo: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>AIRLINE OPERATOR *</label>
                    <select
                      value={addForm.airline}
                      onChange={(e) =>
                        setAddForm({ ...addForm, airline: e.target.value })
                      }
                    >
                      <option value="SkyRebook Express">SkyRebook Express</option>
                      <option value="Air India Express">Air India Express</option>
                      <option value="IndiGo Alliance">IndiGo Alliance</option>
                      <option value="SpiceJet Partner">SpiceJet Partner</option>
                      <option value="Akasa Air">Akasa Air</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>DEPARTURE AIRPORT *</label>
                    <select
                      value={addForm.fromCity}
                      onChange={(e) =>
                        setAddForm({ ...addForm, fromCity: e.target.value })
                      }
                    >
                      <option value="MAA (Chennai)">Chennai (MAA)</option>
                      <option value="BOM (Mumbai)">Mumbai (BOM)</option>
                      <option value="DEL (Delhi)">Delhi (DEL)</option>
                      <option value="BLR (Bangalore)">Bangalore (BLR)</option>
                      <option value="HYD (Hyderabad)">Hyderabad (HYD)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>DESTINATION AIRPORT *</label>
                    <select
                      value={addForm.toCity}
                      onChange={(e) =>
                        setAddForm({ ...addForm, toCity: e.target.value })
                      }
                    >
                      <option value="DEL (Delhi)">Delhi (DEL)</option>
                      <option value="MAA (Chennai)">Chennai (MAA)</option>
                      <option value="BOM (Mumbai)">Mumbai (BOM)</option>
                      <option value="BLR (Bangalore)">Bangalore (BLR)</option>
                      <option value="HYD (Hyderabad)">Hyderabad (HYD)</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label>DEPARTURE TIME *</label>
                    <input
                      type="text"
                      placeholder="e.g. 11:30 AM"
                      value={addForm.departure}
                      onChange={(e) =>
                        setAddForm({ ...addForm, departure: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>ESTIMATED ARRIVAL TIME</label>
                    <input
                      type="text"
                      placeholder="e.g. 01:45 PM"
                      value={addForm.arrival}
                      onChange={(e) =>
                        setAddForm({ ...addForm, arrival: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>TOTAL SEATS CAPACITY *</label>
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={addForm.seats}
                      onChange={(e) =>
                        setAddForm({ ...addForm, seats: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>OPERATIONAL STATUS</label>
                  <select
                    value={addForm.status}
                    onChange={(e) =>
                      setAddForm({ ...addForm, status: e.target.value })
                    }
                  >
                    <option value="On Time">On Time (Normal Schedule)</option>
                    <option value="DELAYED 45M">Delayed 45 Minutes</option>
                    <option value="DELAYED 90M">Delayed 90 Minutes</option>
                    <option value="CANCELLED">
                      CANCELLED (Emergency Rebooking Required)
                    </option>
                  </select>
                </div>

                <div className="form-submit-row">
                  <button
                    type="button"
                    className="btn-reset"
                    onClick={() => setActiveTab("view-flights")}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary-submit">
                    <PlusIcon size={18} /> Add Flight to Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW FLIGHTS TAB */}
        {activeTab === "view-flights" && (
          <div className="tab-pane">
            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h3>Scheduled Flights Database ({flights.length})</h3>
                  <p>View, edit status, or remove flight segments from the live database</p>
                </div>
                <div className="header-actions-right">
                  <div className="filter-pills">
                    {["All", "On Time", "Delayed", "Cancelled"].map((status) => (
                      <button
                        key={status}
                        className={`filter-btn ${
                          flightFilter === status ? "active" : ""
                        }`}
                        onClick={() => setFlightFilter(status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  <button
                    className="btn-add-flight-top"
                    onClick={() => setActiveTab("add-flight")}
                  >
                    <PlusIcon size={16} /> Add Flight
                  </button>
                </div>
              </div>

              <div className="search-bar-inline">
                <SearchIcon size={16} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search by Flight No, Airline, Origin, or Destination..."
                  value={flightSearch}
                  onChange={(e) => setFlightSearch(e.target.value)}
                />
              </div>

              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>FLIGHT NO</th>
                      <th>AIRLINE OPERATOR</th>
                      <th>ORIGIN → DESTINATION</th>
                      <th>DEPARTURE</th>
                      <th>SEATS LEFT</th>
                      <th>OPERATIONAL STATUS</th>
                      <th>MANAGE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flightsLoading ? (
                      <tr>
                        <td colSpan="7" className="no-data-cell">
                          Loading flights from MongoDB...
                        </td>
                      </tr>
                    ) : filteredFlights.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="no-data-cell">
                          No flights found matching search.
                        </td>
                      </tr>
                    ) : (
                      filteredFlights.map((flight) => (
                        <tr key={flight.id || flight.flightNo}>
                          <td>
                            <strong className="flight-code">
                              {flight.flightNo}
                            </strong>
                          </td>
                          <td>{flight.airline}</td>
                          <td>
                            <strong>{flight.from}</strong> →{" "}
                            <strong>{flight.to}</strong>
                          </td>
                          <td>{flight.departure}</td>
                          <td>
                            <strong>{flight.seats}</strong> seats
                          </td>
                          <td>
                            <span className={`status-pill ${flight.statusType}`}>
                              {flight.status}
                            </span>
                          </td>
                          <td>
                            <div className="table-action-btns">
                              <button
                                className="icon-btn edit"
                                title="Edit Status"
                                onClick={() => handleOpenEdit(flight)}
                              >
                                <EditIcon size={16} /> Edit
                              </button>
                              <button
                                className="icon-btn delete"
                                title="Delete Flight"
                                onClick={() => handleDeleteFlight(flight.flightNo)}
                              >
                                <TrashIcon size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* EDIT FLIGHT MODAL */}
      {isEditModalOpen && editingFlight && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <EditIcon size={20} color="#2563eb" /> Edit Flight — {editingFlight.flightNo}
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                <XIcon size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Flight Segment</label>
                <input
                  type="text"
                  disabled
                  value={`${editingFlight.flightNo} (${editingFlight.from} → ${editingFlight.to})`}
                />
              </div>

              <div className="form-group">
                <label>Operational Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="On Time">On Time (Normal Schedule)</option>
                  <option value="DELAYED 45M">Delayed 45 Minutes</option>
                  <option value="DELAYED 90M">Delayed 90 Minutes</option>
                  <option value="CANCELLED">
                    CANCELLED (Emergency Rebooking Triggered)
                  </option>
                  <option value="REBOOKING OPEN">REBOOKING OPEN</option>
                </select>
              </div>

              <div className="form-group">
                <label>Available Seat Count</label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={newSeats}
                  onChange={(e) => setNewSeats(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-confirm-final"
                  onClick={handleSaveEditedFlight}
                >
                  Save & Update Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ADMIN MESSAGE MODAL */}
      {editingRequestMsg && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <ShieldIcon size={20} color="#2563eb" /> Admin Message — {editingRequestMsg.id}
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setEditingRequestMsg(null)}
              >
                <XIcon size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "12px" }}>
                Enter custom admin message for passenger {editingRequestMsg.passengerName || editingRequestMsg.passenger}:
              </p>
              <div className="form-group">
                <textarea
                  rows="4"
                  style={{ width: "100%", padding: "10px", fontSize: "14px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  value={adminResponseText}
                  onChange={(e) => setAdminResponseText(e.target.value)}
                  placeholder="e.g. Your rebooking request has been approved. Please travel on SR305 at 06:15 PM."
                ></textarea>
              </div>
              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setEditingRequestMsg(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-confirm-final"
                  onClick={handleSaveAdminMessage}
                >
                  Save Admin Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST ALERT */}
      {toastMessage && <div className="toast-alert success">{toastMessage}</div>}
    </div>
  );
}

export default AdminDashboard;