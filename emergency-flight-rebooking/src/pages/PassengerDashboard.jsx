import { useEffect, useMemo, useState } from "react";
import "./PassengerDashboard.css";

import {
  PlaneIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  QrCodeIcon,
  PrinterIcon,
  DownloadIcon,
  XIcon,
  UserIcon,
  ClockIcon,
  SearchIcon,
  ArrowRightIcon,
} from "../components/Icons";

function PassengerDashboard({ onLogout }) {
  /* =========================================================
     USER DATA
     ========================================================= */

  const storedUser =
    JSON.parse(localStorage.getItem("skyrebookUser")) || {
      name: "Gokul Kumar",
      email: "passenger@example.com",
      phone: "+91 9876543210",
    };

  /* =========================================================
     DEFAULT FLIGHTS DATA
     ========================================================= */

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

  /* =========================================================
     STATE
     ========================================================= */

  const [flights, setFlights] = useState([]);
  const [requests, setRequests] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Active section: 'flights' | 'rebooking' | 'boarding'
  const [activeSection, setActiveSection] = useState("flights");

  // Search Input State
  const [flightSearchInput, setFlightSearchInput] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");

  // Rebooking Modal & Form State
  const [isRebookingOpen, setIsRebookingOpen] = useState(false);
  const [selectedAltFlight, setSelectedAltFlight] = useState(null);

  const [rebookForm, setRebookForm] = useState({
    passengerName: storedUser.name,
    email: storedUser.email,
    pnr: "SRBK-8842",
    requestedSeat: "12A (Window)",
    reason: "",
    message: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [toastMessage, setToastMessage] = useState("");

  /* =========================================================
     DYNAMIC SEAT GENERATOR BASED ON FLIGHT SEAT CAPACITY
     ========================================================= */

  const dynamicSeats = useMemo(() => {
    if (!selectedAltFlight) return [];
    const count = Math.max(1, Math.min(selectedAltFlight.seats || 10, 60));
    const seatsList = [];
    const letters = [
      { char: "A", type: "Window" },
      { char: "B", type: "Middle" },
      { char: "C", type: "Aisle" },
      { char: "D", type: "Aisle" },
      { char: "E", type: "Middle" },
      { char: "F", type: "Window" },
    ];

    let rowNum = 12;
    for (let i = 0; i < count; i++) {
      const letterObj = letters[i % 6];
      seatsList.push(`${rowNum}${letterObj.char} (${letterObj.type})`);
      if ((i + 1) % 6 === 0) {
        rowNum += rowNum === 12 ? 2 : 1;
      }
    }
    return seatsList;
  }, [selectedAltFlight]);

  /* =========================================================
     LOAD LIVE DATA FROM MONGODB
     ========================================================= */

  useEffect(() => {
    const normalizeFlight = (flight) => ({
      id: flight._id || flight.id || flight.flightNo,
      flightNo: flight.flightNo,
      airline: flight.airline,
      from: flight.departure || flight.from || "",
      to: flight.destination || flight.to || "",
      fromCity: flight.fromCity || flight.departure || "",
      toCity: flight.toCity || flight.destination || "",
      date: flight.date || "03 Oct 2026",
      departure: flight.departureTime || flight.departure || "",
      arrival: flight.arrivalTime || flight.arrival || "TBD",
      seats: Number(flight.availableSeats ?? flight.seats ?? 0),
      totalSeats: Number(flight.totalSeats ?? flight.seats ?? 0),
      status: flight.status || "On Time",
      statusType: flight.statusType || "active",
    });

    const fetchDashboardData = async () => {
      try {
        try {
          const flightRes = await fetch("http://localhost:5000/api/flights");
          if (flightRes.ok) {
            const flightData = await flightRes.json();
            if (Array.isArray(flightData)) {
              const apiFlights = flightData.map(normalizeFlight);
              setFlights(apiFlights);
            }
          }
        } catch (fErr) {
          console.error("Flight fetch error:", fErr);
          setFlights([]);
        }

        try {
          const reqRes = await fetch(
            `http://localhost:5000/api/rebooking-requests/passenger/${encodeURIComponent(
              storedUser.email
            )}`
          );
          if (reqRes.ok) {
            const requestData = await reqRes.json();
            if (Array.isArray(requestData)) {
              setRequests(requestData);
            }
          }
        } catch (rErr) {
          console.error("Request fetch error:", rErr);
        }
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();

    const interval = setInterval(fetchDashboardData, 3000);

    return () => clearInterval(interval);
  }, [storedUser.email]);

  /* =========================================================
     PASSENGER REQUESTS & BOOKING COMPUTATION
     ========================================================= */

  const myRequests = useMemo(() => {
    return requests.filter(
      (req) =>
        req.email?.toLowerCase() === storedUser.email.toLowerCase() ||
        req.pnr === "SRBK-8842" ||
        req.passengerName?.toLowerCase() === storedUser.name.toLowerCase() ||
        req.passenger?.toLowerCase() === storedUser.name.toLowerCase()
    );
  }, [requests, storedUser]);

  const approvedRequest = useMemo(() => {
    return myRequests.find((req) => req.status === "Approved");
  }, [myRequests]);

  const currentBooking = useMemo(() => {
    if (approvedRequest) {
      const routeParts = approvedRequest.route ? approvedRequest.route.split("→") : [];
      return {
        bookingId: approvedRequest.pnr || "SRBK-8842",
        flightNo: approvedRequest.requestedFlight,
        airline: "SkyRebook Alliance",
        routeFrom: routeParts[0]?.trim() || "Delhi (DEL)",
        routeTo: routeParts[1]?.trim() || "Bangalore (BLR)",
        route: approvedRequest.route || "Delhi (DEL) → Bangalore (BLR)",
        from: "DEL",
        fromCity: routeParts[0]?.trim() || "Delhi",
        to: "BLR",
        toCity: routeParts[1]?.trim() || "Bangalore",
        date: approvedRequest.date || "03 Oct 2026",
        departureTime: "06:15 PM",
        arrivalTime: "08:45 PM",
        seat: approvedRequest.requestedSeat || "12A",
        gate: "B12",
        terminal: "T2",
        status: "REBOOKED & APPROVED",
        statusType: "success",
        disruptionMessage: `Rebooking approved for ${approvedRequest.requestedFlight}. Digital boarding pass generated for assigned seat ${approvedRequest.requestedSeat || "12A"}.`,
      };
    }

    return null;
  }, [approvedRequest]);

  /* =========================================================
     SAFE ROUTE & AIRPORT SEARCH PARSER
     ========================================================= */

  const getFlightLocationDetails = (flight, direction) => {
    const rawCode = (flight?.[direction] || "").toString();
    const rawCity = (flight?.[`${direction}City`] || "").toString();

    const knownAirports = [
      { code: "DEL", city: "Delhi", aliases: ["delhi", "del", "indira gandhi"] },
      { code: "BLR", city: "Bangalore", aliases: ["bangalore", "bengaluru", "blr", "kempegowda"] },
      { code: "MAA", city: "Chennai", aliases: ["chennai", "maa", "madras"] },
      { code: "BOM", city: "Mumbai", aliases: ["mumbai", "bom", "chhatrapati shivaji"] },
      { code: "HYD", city: "Hyderabad", aliases: ["hyderabad", "hyd", "rajiv gandhi"] },
    ];

    const combined = `${rawCode} ${rawCity}`.toLowerCase();
    let detectedCode = "";
    let detectedCity = rawCity;

    for (const item of knownAirports) {
      if (item.aliases.some((alias) => combined.includes(alias))) {
        detectedCode = item.code;
        if (!detectedCity) detectedCity = item.city;
        break;
      }
    }

    if (!detectedCode) {
      const codeMatch = rawCode.match(/\b([A-Z]{3})\b/i);
      if (codeMatch) {
        detectedCode = codeMatch[1].toUpperCase();
      } else {
        detectedCode = rawCode.toUpperCase().slice(0, 3) || "AIR";
      }
    }

    if (!detectedCity) {
      detectedCity = rawCode
        .replace(/\(.*\)/, "")
        .replace(/^[A-Z]{3}\s*[-–]?\s*/i, "")
        .trim() || detectedCode;
    }

    return {
      code: detectedCode,
      city: detectedCity,
      fullText: `${detectedCode} ${detectedCity} ${rawCode} ${rawCity}`.toLowerCase(),
    };
  };

  const handleExecuteSearch = (queryToSet = flightSearchInput) => {
    setFlightSearchInput(queryToSet);
    setActiveSearchQuery(queryToSet.trim());
  };

  const handleClearSearch = () => {
    setFlightSearchInput("");
    setActiveSearchQuery("");
  };

  const searchResults = useMemo(() => {
    const query = (activeSearchQuery || flightSearchInput).trim();
    if (!query) {
      return {
        isSearch: false,
        title: "Available Flights Manifest",
        queryText: "",
        list: flights,
      };
    }

    const routeSeparators = /→|->|-|\bto\b/i;
    let parts = [];

    if (routeSeparators.test(query)) {
      parts = query.split(routeSeparators).map((s) => s.trim()).filter(Boolean);
    } else {
      const spaceParts = query.split(/\s+/).map((s) => s.trim()).filter(Boolean);
      if (spaceParts.length === 2) {
        parts = spaceParts;
      }
    }

    if (parts.length >= 2) {
      const srcTerm = parts[0].toLowerCase();
      const destTerm = parts[1].toLowerCase();

      const matched = flights.filter((flight) => {
        if (!flight) return false;
        const fromDetails = getFlightLocationDetails(flight, "from");
        const toDetails = getFlightLocationDetails(flight, "to");

        const fromMatch =
          fromDetails.code.toLowerCase() === srcTerm ||
          fromDetails.city.toLowerCase().includes(srcTerm) ||
          fromDetails.fullText.includes(srcTerm);

        const toMatch =
          toDetails.code.toLowerCase() === destTerm ||
          toDetails.city.toLowerCase().includes(destTerm) ||
          toDetails.fullText.includes(destTerm);

        return fromMatch && toMatch;
      });

      return {
        isSearch: true,
        queryText: `${parts[0].toUpperCase()} → ${parts[1].toUpperCase()}`,
        title: `Search Results for: ${parts[0].toUpperCase()} → ${parts[1].toUpperCase()}`,
        list: matched,
      };
    }

    const lower = query.toLowerCase();
    const matched = flights.filter((flight) => {
      if (!flight) return false;
      const fromDetails = getFlightLocationDetails(flight, "from");
      const toDetails = getFlightLocationDetails(flight, "to");

      const fNo = (flight.flightNo || "").toLowerCase();
      const fAirline = (flight.airline || "").toLowerCase();

      return (
        fNo.includes(lower) ||
        fAirline.includes(lower) ||
        fromDetails.fullText.includes(lower) ||
        toDetails.fullText.includes(lower)
      );
    });

    return {
      isSearch: true,
      queryText: query,
      title: `Search Results for "${query}"`,
      list: matched,
    };
  }, [flights, flightSearchInput, activeSearchQuery]);

  /* =========================================================
     TOAST HANDLER
     ========================================================= */

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4500);
  };

  /* =========================================================
     REBOOKING MODAL HANDLERS
     ========================================================= */

  const openRebookingRequestModal = (flight) => {
    setSelectedAltFlight(flight);
    setRebookForm({
      passengerName: storedUser.name,
      email: storedUser.email,
      pnr: currentBooking?.bookingId || "SRBK-8842",
      requestedSeat: "12A (Window)",
      reason: "",
      message: "",
    });
    setFormErrors({});
    setIsRebookingOpen(true);
  };

  const closeRebookingModal = () => {
    setIsRebookingOpen(false);
    setSelectedAltFlight(null);
    setFormErrors({});
  };

  const handleSubmitRebookingRequest = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!rebookForm.passengerName.trim()) {
      errors.passengerName = "Passenger Name is required.";
    }
    if (!rebookForm.email.trim()) {
      errors.email = "Email address is required.";
    }
    if (!rebookForm.pnr.trim()) {
      errors.pnr = "PNR reference is required.";
    }
    if (!rebookForm.requestedSeat) {
      errors.requestedSeat = "Please select a preferred seat.";
    }
    if (!rebookForm.reason) {
      errors.reason = "Please select a reason for rebooking.";
    }
    if (rebookForm.reason === "Other" && !rebookForm.message.trim()) {
      errors.message = "Please provide details when selecting 'Other'.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!selectedAltFlight) return;

    setFormErrors({});

    const newReqId = `REQ-${Date.now().toString().slice(-6)}`;
    const altFromDetails = getFlightLocationDetails(selectedAltFlight, "from");
    const altToDetails = getFlightLocationDetails(selectedAltFlight, "to");

    const newRequest = {
      requestId: newReqId,
      pnr: rebookForm.pnr.trim(),
      passengerName: rebookForm.passengerName.trim(),
      passenger: rebookForm.passengerName.trim(),
      email: rebookForm.email.trim(),
      currentFlight: currentBooking?.flightNo || "CANCELLED",
      requestedFlight: selectedAltFlight.flightNo,
      requestedSeat: rebookForm.requestedSeat,
      route: `${altFromDetails.city} → ${altToDetails.city}`,
      reason: rebookForm.reason,
      message: rebookForm.message.trim() || "Passenger requested alternative flight allocation.",
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: "Pending",
      adminMessage: "",
      avatar: rebookForm.passengerName
        .trim()
        .substring(0, 2)
        .toUpperCase(),
    };

    try {
      const response = await fetch("http://localhost:5000/api/rebooking-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRequest),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit rebooking request");
      }

      setRequests((prev) => [data.request, ...prev]);
      closeRebookingModal();
      showToast(`✓ Rebooking Request ${newReqId} submitted! Awaiting Admin approval.`);
      setActiveSection("rebooking");
    } catch (error) {
      console.error("Rebooking request submission error:", error);
      showToast(`✕ ${error.message || "Could not submit request."}`);
    }
  };

  const handleDownload = () => {
    if (!currentBooking) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const width = 800;
    const height = 420;
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    // Background Card
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, 16);
    ctx.fill();
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Header Banner
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.roundRect(0, 0, width, 80, [16, 16, 0, 0]);
    ctx.fill();

    // Airline Name & Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.fillText("SkyRebook Express", 32, 40);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillText("Boarding Pass / E-Ticket", 32, 60);

    // Priority Tag
    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.roundRect(width - 190, 24, 158, 32, 6);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PRIORITY REBOOKING", width - 111, 44);
    ctx.textAlign = "left";

    // Top Row (Passenger Name, PNR Code, Flight No) - NO DATE!
    const topY = 118;
    const col3Width = (width - 64) / 3;

    // Passenger Name
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillText("PASSENGER NAME", 32, topY);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 17px system-ui, sans-serif";
    ctx.fillText(storedUser.name, 32, topY + 22);

    // PNR Code
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillText("PNR CODE", 32 + col3Width, topY);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 17px system-ui, sans-serif";
    ctx.fillText(currentBooking.bookingId, 32 + col3Width, topY + 22);

    // Flight No
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillText("FLIGHT NO", 32 + col3Width * 2, topY);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 17px system-ui, sans-serif";
    ctx.fillText(currentBooking.flightNo, 32 + col3Width * 2, topY + 22);

    // Route Box
    const routeY = 175;
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.roundRect(32, routeY, width - 64, 120, 12);
    ctx.fill();

    // Departure Location
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillText("DEPARTURE", 56, routeY + 28);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 32px system-ui, sans-serif";
    ctx.fillText(currentBooking.from, 56, routeY + 65);
    ctx.fillStyle = "#64748b";
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText(currentBooking.fromCity, 56, routeY + 85);
    ctx.fillStyle = "#2563eb";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.fillText(currentBooking.departureTime, 56, routeY + 104);

    // Route Direct Arrow
    ctx.fillStyle = "#2563eb";
    ctx.font = "bold 24px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("➔", width / 2, routeY + 58);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillText("DIRECT", width / 2, routeY + 78);
    ctx.textAlign = "left";

    // Arrival Location
    const arrX = width - 200;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillText("ARRIVAL", arrX, routeY + 28);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 32px system-ui, sans-serif";
    ctx.fillText(currentBooking.to, arrX, routeY + 65);
    ctx.fillStyle = "#64748b";
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText(currentBooking.toCity, arrX, routeY + 85);
    ctx.fillStyle = "#2563eb";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.fillText(currentBooking.arrivalTime, arrX, routeY + 104);

    // Secondary Row (Seat Assigned, Gate, Terminal, Boarding Status)
    const btmY = 325;
    const col4Width = (width - 64) / 4;

    // Seat Assigned
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillText("SEAT ASSIGNED", 32, btmY);
    ctx.fillStyle = "#2563eb";
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.fillText(currentBooking.seat, 32, btmY + 24);

    // Gate
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillText("GATE", 32 + col4Width, btmY);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.fillText(currentBooking.gate, 32 + col4Width, btmY + 24);

    // Terminal
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillText("TERMINAL", 32 + col4Width * 2, btmY);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.fillText(currentBooking.terminal, 32 + col4Width * 2, btmY + 24);

    // Boarding Status
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillText("BOARDING STATUS", 32 + col4Width * 3, btmY);
    ctx.fillStyle = "#16a34a";
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.fillText("CONFIRMED", 32 + col4Width * 3, btmY + 24);

    // Trigger PNG download
    const a = document.createElement("a");
    a.download = `BoardingPass_${currentBooking.bookingId}_${currentBooking.flightNo}.png`;
    a.href = canvas.toDataURL("image/png");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("✓ Boarding Pass downloaded successfully!");
  };

  const getFlightStatusClass = (statusType) => {
    if (statusType === "danger") return "passenger-flight-danger";
    if (statusType === "processing") return "passenger-flight-processing";
    return "passenger-flight-active";
  };

  return (
    <div className="passenger-page">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="passenger-toast">
          <CheckCircleIcon size={20} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP NAVBAR */}
      <header className="passenger-navbar">
        <div className="passenger-brand">
          <div className="passenger-brand-icon">
            <PlaneIcon size={22} color="#ffffff" />
          </div>
          <div>
            <h2>SkyRebook</h2>
            <span>Passenger Portal</span>
          </div>
        </div>

        <div className="passenger-user-area">
          <div className="passenger-user-avatar">
            <UserIcon size={18} color="#2563eb" />
          </div>
          <div className="passenger-user-info">
            <strong>{storedUser.name}</strong>
            <span>{storedUser.email}</span>
          </div>
          <button className="passenger-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* DASHBOARD LAYOUT */}
      <div className="passenger-layout">
        {/* SIDEBAR (Only Find Flights, Rebooking Status, Digital Boarding Pass) */}
        <aside className="passenger-sidebar">
          <div className="sidebar-section-title">PASSENGER MENU</div>

          <button
            className={`passenger-nav-item ${activeSection === "flights" ? "active" : ""}`}
            onClick={() => setActiveSection("flights")}
          >
            <SearchIcon size={18} />
            <span>Find Flights</span>
          </button>

          <button
            className={`passenger-nav-item ${activeSection === "rebooking" ? "active" : ""}`}
            onClick={() => setActiveSection("rebooking")}
          >
            <AlertTriangleIcon size={18} />
            <span>Rebooking Status</span>
            {myRequests.length > 0 && <span className="sidebar-count">{myRequests.length}</span>}
          </button>

          <button
            className={`passenger-nav-item ${activeSection === "boarding" ? "active" : ""}`}
            onClick={() => setActiveSection("boarding")}
          >
            <QrCodeIcon size={18} />
            <span>Digital Boarding Pass</span>
          </button>

          <div className="passenger-sidebar-bottom">
            <div className="sidebar-account-card">
              <div className="sidebar-account-icon">
                <UserIcon size={18} />
              </div>
              <div>
                <strong>My Account</strong>
                <span>{storedUser.name}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="passenger-main">
          {/* =================================================
              1. FIND FLIGHTS (MAIN DEFAULT PAGE)
              ================================================= */}
          {activeSection === "flights" && (
            <>
              <div className="passenger-page-heading">
                <div>
                  <span className="passenger-page-label">FLIGHT SEARCH & REBOOKING</span>
                  <h1>FIND YOUR FLIGHT</h1>
                  <p>Search available flights by route, airport or flight number.</p>
                </div>
                {currentBooking && (
                  <div className="passenger-pnr-card">
                    <span>ACTIVE PNR</span>
                    <strong>{currentBooking.bookingId}</strong>
                  </div>
                )}
              </div>

              {/* DISRUPTION STATUS ALERT */}
              {currentBooking?.status === "CANCELLED" && (
                <section className="passenger-alert alert-danger">
                  <div className="passenger-alert-content">
                    <div className="passenger-alert-icon">
                      <AlertTriangleIcon size={24} color="#ffffff" />
                    </div>
                    <div>
                      <h3>Flight Disruption Notice: {currentBooking.flightNo} Cancelled</h3>
                      <p>
                        Your flight <strong>{currentBooking.flightNo}</strong> ({currentBooking.route}) has been cancelled. Please select an available alternative flight below to submit a rebooking request.
                      </p>
                    </div>
                  </div>
                </section>
              )}
              {currentBooking?.status === "REBOOKED & APPROVED" && (
                <section className="passenger-alert alert-success">
                  <div className="passenger-alert-content">
                    <div className="passenger-alert-icon">
                      <CheckCircleIcon size={24} color="#ffffff" />
                    </div>
                    <div>
                      <h3>Active Booking Status: {currentBooking.status}</h3>
                      <p>{currentBooking.disruptionMessage}</p>
                    </div>
                  </div>
                </section>
              )}

              {/* SEARCH BOX */}
              <section className="flight-search-card">
                <div className="flight-search-title">
                  <h2>Search Available Flights</h2>
                  <p>Search by route (e.g. DEL → BLR, MAA → DEL), city name (Delhi, Bangalore), or flight code (SR204)</p>
                </div>

                <form
                  className="flight-search-box"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleExecuteSearch(flightSearchInput);
                  }}
                >
                  <div className="search-input-wrapper">
                    <PlaneIcon size={20} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="Example: DEL → BLR"
                      value={flightSearchInput}
                      onChange={(e) => {
                        setFlightSearchInput(e.target.value);
                        setActiveSearchQuery(e.target.value);
                      }}
                    />
                    {flightSearchInput && (
                      <button type="button" className="clear-search" onClick={handleClearSearch}>
                        <XIcon size={18} />
                      </button>
                    )}
                  </div>
                  <button type="submit" className="flight-search-btn">
                    <SearchIcon size={18} color="#ffffff" />
                    Search Flights
                  </button>
                </form>

                <div className="quick-routes-hints">
                  <span>Quick Route Search:</span>
                  <button onClick={() => handleExecuteSearch("DEL → BLR")}>DEL → BLR</button>
                  <button onClick={() => handleExecuteSearch("MAA → DEL")}>MAA → DEL</button>
                  <button onClick={() => handleExecuteSearch("BOM → BLR")}>BOM → BLR</button>
                  <button onClick={() => handleExecuteSearch("SR204")}>SR204</button>
                </div>
              </section>

              {/* RESULTS HEADING */}
              <div className="flight-results-heading">
                <div>
                  <h2>{searchResults.title}</h2>
                  <span>
                    {searchResults.list.length} flight{searchResults.list.length !== 1 ? "s" : ""} found
                  </span>
                </div>
              </div>

              {/* FLIGHT LIST */}
              <div className="available-flight-list">
                {dataLoading ? (
                  <div className="no-flights">
                    <div className="no-flights-icon">
                      <PlaneIcon size={32} color="#94a3b8" />
                    </div>
                    <h3>Loading live flight data...</h3>
                    <p>Fetching available flights from the SkyRebook database.</p>
                  </div>
                ) : searchResults.list.length === 0 ? (
                  <div className="no-flights">
                    <div className="no-flights-icon">
                      <PlaneIcon size={32} color="#94a3b8" />
                    </div>
                    <h3>No flights found for {searchResults.queryText || flightSearchInput}</h3>
                    <p>Try searching another route (e.g. DEL → BLR, MAA → DEL) or airport code.</p>
                    <button className="reset-search-btn" onClick={handleClearSearch}>
                      Clear Search & View All Flights
                    </button>
                  </div>
                ) : (
                  searchResults.list.map((flight) => {
                    const fromLoc = getFlightLocationDetails(flight, "from");
                    const toLoc = getFlightLocationDetails(flight, "to");

                    return (
                      <div className="available-flight-card" key={flight.id || flight.flightNo}>
                        <div className="available-flight-top">
                          <div className="available-flight-title">
                            <div className="flight-logo">
                              <PlaneIcon size={20} color="#2563eb" />
                            </div>
                            <div>
                              <strong>{flight.flightNo}</strong>
                              <span>{flight.airline}</span>
                            </div>
                          </div>

                          <span className={`flight-status-tag ${getFlightStatusClass(flight.statusType)}`}>
                            {flight.status}
                          </span>
                        </div>

                        <div className="available-flight-main">
                          <div className="flight-location">
                            <strong>{fromLoc.code}</strong>
                            <span>{fromLoc.city}</span>
                            <small>Departure: {flight.departure}</small>
                          </div>

                          <div className="flight-path">
                            <span>Direct Segment</span>
                            <div>
                              <i></i>
                              <PlaneIcon size={18} color="#2563eb" />
                              <i></i>
                            </div>
                            <small>{flight.date || "03 Oct 2026"}</small>
                          </div>

                          <div className="flight-location right">
                            <strong>{toLoc.code}</strong>
                            <span>{toLoc.city}</span>
                            <small>Arrival: {flight.arrival}</small>
                          </div>
                        </div>

                        <div className="available-flight-bottom">
                          <div className="available-seat-info">
                            <span>SEAT CAPACITY</span>
                            <strong className={flight.seats === 0 ? "no-seat" : ""}>
                              {flight.seats === 0 ? "No Seats Left" : `${flight.seats} Seats Available`}
                            </strong>
                          </div>

                          <button
                            className="request-flight-btn"
                            disabled={flight.seats === 0}
                            onClick={() => openRebookingRequestModal(flight)}
                          >
                            {flight.seats === 0 ? "Full" : "Request Rebooking →"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* =================================================
              2. REBOOKING STATUS PAGE
              ================================================= */}
          {activeSection === "rebooking" && (
            <>
              <div className="passenger-page-heading">
                <div>
                  <span className="passenger-page-label">OPERATIONS QUEUE</span>
                  <h1>Rebooking Status</h1>
                  <p>Track your submitted requests and view real-time messages from Admin.</p>
                </div>
                <div className="passenger-pnr-card">
                  <span>PASSENGER</span>
                  <strong>{storedUser.name}</strong>
                </div>
              </div>

              {myRequests.length === 0 ? (
                <div className="no-flights">
                  <div className="no-flights-icon">
                    <AlertTriangleIcon size={32} color="#94a3b8" />
                  </div>
                  <h3>No Rebooking Requests Submitted Yet</h3>
                  <p>You haven't submitted any rebooking requests. Go to Find Flights to choose an alternative flight.</p>
                  <button className="reset-search-btn" onClick={() => setActiveSection("flights")}>
                    Search Available Flights →
                  </button>
                </div>
              ) : (
                <div className="requests-timeline">
                  {myRequests.map((req) => (
                    <div className="request-card-item" key={req.id}>
                      <div className="request-card-header">
                        <div className="request-id-badge">
                          <strong>{req.id}</strong>
                          <span>PNR: {req.pnr}</span>
                        </div>
                        <div className={`status-pill pill-${(req.status || "Pending").toLowerCase()}`}>
                          {req.status}
                        </div>
                      </div>

                      <div className="request-card-body">
                        <div className="req-detail-grid">
                          <div>
                            <span>Current Flight</span>
                            <strong>{req.currentFlight}</strong>
                          </div>
                          <div>
                            <span>Requested Flight</span>
                            <strong>{req.requestedFlight}</strong>
                          </div>
                          <div>
                            <span>Selected Seat</span>
                            <strong>{req.requestedSeat || "12A"}</strong>
                          </div>
                          <div>
                            <span>Reason</span>
                            <strong>{req.reason}</strong>
                          </div>
                        </div>

                        {req.message && (
                          <div className="req-user-msg">
                            <span>Your Message:</span>
                            <p>"{req.message}"</p>
                          </div>
                        )}

                        {req.adminMessage ? (
                          <div className="req-admin-response">
                            <div className="admin-msg-header">
                              <CheckCircleIcon size={16} color="#2563eb" />
                              <strong>Message from Admin Operations:</strong>
                            </div>
                            <p>{req.adminMessage}</p>
                          </div>
                        ) : (
                          <div className="req-admin-pending">
                            <ClockIcon size={16} color="#d97706" />
                            <span>Your request is queued for Admin review. Seat will be allocated upon Approval.</span>
                          </div>
                        )}
                      </div>

                      {req.status === "Approved" && (
                        <div className="request-card-footer">
                          <button className="view-boarding-btn" onClick={() => setActiveSection("boarding")}>
                            <QrCodeIcon size={16} /> View Digital Boarding Pass
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* =================================================
              3. DIGITAL BOARDING PASS PAGE
              ================================================= */}
          {activeSection === "boarding" && (
            <>
              <div className="passenger-page-heading">
                <div>
                  <span className="passenger-page-label">VERIFIED TRAVEL DOCUMENT</span>
                  <h1>Digital Boarding Pass</h1>
                  <p>Official airline boarding pass generated upon Admin approval.</p>
                </div>
                <button className="passenger-primary-btn" onClick={handleDownload}>
                  <DownloadIcon size={18} />
                  Download Boarding Pass
                </button>
              </div>

              {approvedRequest ? (
                <div className="boarding-pass-document">
                  <div className="pass-header">
                    <div className="pass-airline">
                      <PlaneIcon size={24} color="#ffffff" />
                      <div>
                        <h2>SkyRebook Express</h2>
                        <span>Boarding Pass / E-Ticket</span>
                      </div>
                    </div>
                    <div className="pass-class">PRIORITY REBOOKING</div>
                  </div>

                  <div className="pass-body">
                    <div className="pass-grid">
                      <div>
                        <label>PASSENGER NAME</label>
                        <strong>{storedUser.name}</strong>
                      </div>
                      <div>
                        <label>PNR CODE</label>
                        <strong>{currentBooking.bookingId}</strong>
                      </div>
                      <div>
                        <label>FLIGHT NO</label>
                        <strong>{currentBooking.flightNo}</strong>
                      </div>
                    </div>

                    <div className="pass-route-row">
                      <div className="pass-loc">
                        <span>DEPARTURE</span>
                        <h2>{currentBooking.from}</h2>
                        <p>{currentBooking.fromCity}</p>
                        <small>{currentBooking.departureTime}</small>
                      </div>
                      <div className="pass-arrow">
                        <ArrowRightIcon size={28} color="#2563eb" />
                        <span>DIRECT</span>
                      </div>
                      <div className="pass-loc right">
                        <span>ARRIVAL</span>
                        <h2>{currentBooking.to}</h2>
                        <p>{currentBooking.toCity}</p>
                        <small>{currentBooking.arrivalTime}</small>
                      </div>
                    </div>

                    <div className="pass-grid secondary">
                      <div>
                        <label>SEAT ASSIGNED</label>
                        <strong className="seat-badge-approved">{currentBooking.seat}</strong>
                      </div>
                      <div>
                        <label>GATE</label>
                        <strong>{currentBooking.gate}</strong>
                      </div>
                      <div>
                        <label>TERMINAL</label>
                        <strong>{currentBooking.terminal}</strong>
                      </div>
                      <div>
                        <label>BOARDING STATUS</label>
                        <strong className="status-confirmed">CONFIRMED</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-boarding-pass">
                  <div className="no-pass-icon">
                    <QrCodeIcon size={48} color="#94a3b8" />
                  </div>
                  <h3>No Approved Boarding Pass Available</h3>
                  <p>
                    Your digital boarding pass will automatically appear here once Admin approves your rebooking request.
                  </p>
                  <button className="reset-search-btn" onClick={() => setActiveSection("flights")}>
                    Request Rebooking for Cancelled Flight →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* =========================================================
          REBOOKING REQUEST FORM MODAL (DYNAMIC SEAT SELECTION)
          ========================================================= */}
      {isRebookingOpen && selectedAltFlight && (
        <div className="modal-overlay">
          <div className="rebooking-modal">
            <div className="modal-header">
              <div>
                <h2>REQUEST FLIGHT REBOOKING</h2>
                <span className="modal-subtitle">
                  Rebooking requested for Flight <strong>{selectedAltFlight.flightNo}</strong> ({getFlightLocationDetails(selectedAltFlight, "from").city} → {getFlightLocationDetails(selectedAltFlight, "to").city})
                </span>
              </div>
              <button className="modal-close" onClick={closeRebookingModal}>
                <XIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitRebookingRequest} className="modal-form-content">
              <div className="modal-scroll-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Passenger Name *</label>
                    <input
                      type="text"
                      value={rebookForm.passengerName}
                      onChange={(e) => setRebookForm({ ...rebookForm, passengerName: e.target.value })}
                    />
                    {formErrors.passengerName && <span className="field-error">{formErrors.passengerName}</span>}
                  </div>

                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      value={rebookForm.email}
                      onChange={(e) => setRebookForm({ ...rebookForm, email: e.target.value })}
                    />
                    {formErrors.email && <span className="field-error">{formErrors.email}</span>}
                  </div>

                  <div className="form-group full-width">
                    <label>PNR Reference *</label>
                    <input
                      type="text"
                      value={rebookForm.pnr}
                      onChange={(e) => setRebookForm({ ...rebookForm, pnr: e.target.value })}
                    />
                    {formErrors.pnr && <span className="field-error">{formErrors.pnr}</span>}
                  </div>
                </div>

                {/* SINGLE INTERACTIVE SEAT PICKER MATCHING EXACT AVAILABLE SEATS IN ADMIN */}
                <div className="seat-picker-container">
                  <span className="seat-picker-label">
                    Select Available Seat ({dynamicSeats.length} Seats Available on {selectedAltFlight.flightNo}):
                  </span>
                  <div className="seat-pills">
                    {dynamicSeats.map((seat) => (
                      <button
                        type="button"
                        key={seat}
                        className={`seat-chip ${rebookForm.requestedSeat === seat ? "active" : ""}`}
                        onClick={() => setRebookForm({ ...rebookForm, requestedSeat: seat })}
                      >
                        {seat.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                  <small className="selected-seat-note">
                    Selected Seat: <strong>{rebookForm.requestedSeat}</strong>
                  </small>
                  {formErrors.requestedSeat && <span className="field-error">{formErrors.requestedSeat}</span>}
                </div>

                <div className="form-group full-width" style={{ marginTop: "16px" }}>
                  <label>Reason for Rebooking *</label>
                  <select
                    value={rebookForm.reason}
                    onChange={(e) => setRebookForm({ ...rebookForm, reason: e.target.value })}
                  >
                    <option value="">-- Select Reason --</option>
                    <option value="Flight Cancelled">Flight Cancelled</option>
                    <option value="Flight Delayed">Flight Delayed</option>
                    <option value="Missed Connection">Missed Connection</option>
                    <option value="Emergency Schedule Change">Emergency Schedule Change</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.reason && <span className="field-error">{formErrors.reason}</span>}
                </div>

                <div className="form-group full-width" style={{ marginTop: "12px" }}>
                  <label>Additional Information / Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Enter any additional notes for Admin Operations..."
                    value={rebookForm.message}
                    onChange={(e) => setRebookForm({ ...rebookForm, message: e.target.value })}
                  />
                  {formErrors.message && <span className="field-error">{formErrors.message}</span>}
                </div>
              </div>

              {/* STICKY FOOTER ACTIONS */}
              <div className="modal-footer-actions">
                <button type="button" className="btn-secondary" onClick={closeRebookingModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Rebooking Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PassengerDashboard;