import { useState } from "react";
import "./Home.css";
import { 
  PlaneIcon, 
  ZapIcon, 
  ShieldIcon, 
  ClockIcon, 
  SearchIcon, 
  ArrowRightIcon, 
  CheckCircleIcon, 
  AlertTriangleIcon,
  RefreshCwIcon,
  PhoneIcon,
  MailIcon
} from "../components/Icons";

function Home({ onNavigate }) {
  const [searchType, setSearchType] = useState("pnr"); // "pnr" or "route"
  const [pnrInput, setPnrInput] = useState("");
  const [fromCity, setFromCity] = useState("MAA");
  const [toCity, setToCity] = useState("DEL");
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Flight database mock
  const mockFlights = {
    "SR204": { 
      flightNo: "SR204", 
      airline: "SkyRebook Express", 
      route: "Chennai (MAA) → Delhi (DEL)", 
      departure: "10:30 AM", 
      status: "On Time", 
      statusType: "success", 
      text: "Flight operating on scheduled timeline. Gate 4B open for boarding." 
    },
    "AI402": { 
      flightNo: "AI402", 
      airline: "Air India Express", 
      route: "Mumbai (BOM) → Bangalore (BLR)", 
      departure: "02:15 PM", 
      status: "CANCELLED", 
      statusType: "danger", 
      text: "Flight cancelled due to heavy fog. 3 immediate priority rebooking options ready!" 
    },
    "6E105": { 
      flightNo: "6E105", 
      airline: "IndiGo Alliance", 
      route: "Delhi (DEL) → Hyderabad (HYD)", 
      departure: "04:45 PM", 
      status: "DELAYED 90M", 
      statusType: "warning", 
      text: "Flight delayed by 90 minutes. Priority seat transfer enabled." 
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    
    setTimeout(() => {
      setIsSearching(false);
      if (searchType === "pnr") {
        const key = pnrInput.trim().toUpperCase();
        if (mockFlights[key]) {
          setSearchResult(mockFlights[key]);
        } else {
          setSearchResult({
            flightNo: key || "SR-8842",
            airline: "SkyRebook Partner Carrier",
            route: `${fromCity} → ${toCity}`,
            departure: "11:45 AM",
            status: "DISRUPTED",
            statusType: "danger",
            text: "Flight disruption detected. Emergency rebooking assistance active."
          });
        }
      } else {
        setSearchResult({
          flightNo: "SR-9921",
          airline: "SkyRebook Alliance",
          route: `${fromCity} → ${toCity}`,
          departure: "01:30 PM",
          status: "REBOOKING OPEN",
          statusType: "success",
          text: `Direct emergency seats available on ${fromCity} to ${toCity} segment.`
        });
      }
    }, 350);
  };

  const handleQuickSample = (pnr) => {
    setSearchType("pnr");
    setPnrInput(pnr);
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setSearchResult(mockFlights[pnr]);
    }, 250);
  };

  return (
    <div className="home-page">

      {/* ================= HEADER / NAVBAR ================= */}
      <header className="home-navbar">
        <div className="home-logo" onClick={() => onNavigate("home")}>
          <div className="home-logo-icon">
            <PlaneIcon size={24} color="#ffffff" />
          </div>
          <div>
            <h2>SkyRebook</h2>
            <span>Emergency Flight Portal</span>
          </div>
        </div>

        <nav className="home-nav">
          <button className="nav-link active" onClick={() => onNavigate("home")}>Home</button>
          <button className="nav-link" onClick={() => onNavigate("about")}>About</button>
          <button className="nav-link" onClick={() => onNavigate("login")}>Login</button>
        </nav>
      </header>

      {/* ================= HERO SECTION ================= */}
      <main>
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
             
            </div>

            <h1>
              Flight Disrupted?
              <br />
              <span className="gradient-text">Instant Seat Re-Allocation.</span>
            </h1>

            <p>Fast emergency seat re-allocation.</p>

            <div className="hero-buttons">
              <button className="primary-btn" onClick={() => onNavigate("login")}>
                Emergency Rebook Now
                <ArrowRightIcon size={18} />
              </button>
              <button className="secondary-btn" onClick={() => onNavigate("about")}>
                Explore Platform
              </button>
            </div>

            <div className="hero-trust">
              <div className="trust-item">
                <strong>Instant PNR</strong>
                <span>Auto Seat Swap</span>
              </div>
              <div className="trust-line"></div>
              <div className="trust-item">
                <strong>24 / 7 Live</strong>
                <span>Airport Support Desk</span>
              </div>
              <div className="trust-line"></div>
              <div className="trust-item">
                <strong>100% Guaranteed</strong>
                <span>Partner Seat Transfer</span>
              </div>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="hero-visual">
            <div className="single-image-card">
              <div className="image-wrapper">
                <img 
                  src="/images/hero_aircraft.png" 
                  alt="SkyRebook Aircraft Flight Assistance" 
                  className="main-hero-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop";
                  }}
                />
                <div className="image-overlay-gradient"></div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= INTERACTIVE FLIGHT SEARCH WIDGET ================= */}
        <section className="search-widget-section">
          <div className="widget-card">
            <div className="widget-header">
              <div>
                <h3>Check Flight Status & Emergency Rebooking Options</h3>
                <p className="widget-sub">Enter PNR or route</p>
              </div>
              <div className="tab-buttons">
                <button 
                  className={searchType === "pnr" ? "tab-btn active" : "tab-btn"}
                  onClick={() => { setSearchType("pnr"); setSearchResult(null); }}
                >
                  By PNR / Flight No
                </button>
                <button 
                  className={searchType === "route" ? "tab-btn active" : "tab-btn"}
                  onClick={() => { setSearchType("route"); setSearchResult(null); }}
                >
                  By Airport Route
                </button>
              </div>
            </div>

            {/* Quick Sample Selector */}
            <div className="quick-samples">
              <span className="sample-label">Quick Demo Searches:</span>
              <button type="button" className="sample-pill success" onClick={() => handleQuickSample("SR204")}>
                SR204 (On Time)
              </button>
              <button type="button" className="sample-pill danger" onClick={() => handleQuickSample("AI402")}>
                AI402 (Cancelled)
              </button>
              <button type="button" className="sample-pill warning" onClick={() => handleQuickSample("6E105")}>
                6E105 (Delayed 90m)
              </button>
            </div>

            <form onSubmit={handleSearch} className="widget-form">
              {searchType === "pnr" ? (
                <div className="form-row">
                  <div className="input-group flex-2">
                    <label>PNR OR FLIGHT NUMBER</label>
                    <div className="input-with-icon">
                      <PlaneIcon size={18} color="#64748b" className="input-icon" />
                      <input 
                        type="text" 
                        placeholder="e.g. SR204, AI402, 6E105" 
                        value={pnrInput} 
                        onChange={(e) => setPnrInput(e.target.value)}
                      />
                    </div>
                  </div>
                  <button type="submit" className="widget-search-btn" disabled={isSearching}>
                    {isSearching ? (
                      <>
                        <RefreshCwIcon size={16} className="spin" /> Checking...
                      </>
                    ) : (
                      <>
                        <SearchIcon size={16} /> Check Status & Rebook
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="form-row">
                  <div className="input-group">
                    <label>DEPARTURE AIRPORT</label>
                    <select value={fromCity} onChange={(e) => setFromCity(e.target.value)}>
                      <option value="MAA">Chennai (MAA)</option>
                      <option value="BOM">Mumbai (BOM)</option>
                      <option value="DEL">Delhi (DEL)</option>
                      <option value="BLR">Bangalore (BLR)</option>
                      <option value="HYD">Hyderabad (HYD)</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>DESTINATION AIRPORT</label>
                    <select value={toCity} onChange={(e) => setToCity(e.target.value)}>
                      <option value="DEL">Delhi (DEL)</option>
                      <option value="MAA">Chennai (MAA)</option>
                      <option value="BOM">Mumbai (BOM)</option>
                      <option value="BLR">Bangalore (BLR)</option>
                      <option value="HYD">Hyderabad (HYD)</option>
                    </select>
                  </div>
                  <button type="submit" className="widget-search-btn" disabled={isSearching}>
                    {isSearching ? "Searching..." : "Find Emergency Seats"}
                  </button>
                </div>
              )}
            </form>

            {/* DYNAMIC SEARCH RESULT BOX */}
            {searchResult && (
              <div className="search-result-box">
                <div className="result-header">
                  <div>
                    <span className="result-flight">{searchResult.flightNo} • {searchResult.airline}</span>
                    <h4 className="result-route">{searchResult.route}</h4>
                  </div>
                  <span className={`status-pill ${searchResult.statusType}`}>
                    {searchResult.status}
                  </span>
                </div>
                <p className="result-desc">{searchResult.text}</p>
                <div className="result-actions">
                  <button className="btn-action-primary" onClick={() => onNavigate("login")}>
                    Sign In to Claim Emergency Rebooking
                  </button>
                  <button className="btn-action-secondary" onClick={() => onNavigate("register")}>
                    Create Free Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================= SERVICES / FEATURES SECTION ================= */}
        <section className="services-section">
          <div className="section-heading">
            <span className="sub-title">SMART DISRUPTION ARCHITECTURE</span>
            <h2>Designed for Airport Emergency Assistance</h2>
            <p>Fast emergency seat re-allocation.</p>
          </div>

          <div className="services-grid">
            <div className="service-card">
              <div className="card-image-box">
                <img src="/images/rebooking_service.png" alt="Instant Seat Swap" />
              </div>
              <div className="card-content">
                <div className="service-icon icon-blue">
                  <ZapIcon size={22} color="#2563eb" />
                </div>
                <h3>Instant Seat Re-Allocation</h3>
                <p>Instant seat re-allocation.</p>
                <span className="card-no">01</span>
              </div>
            </div>

            <div className="service-card">
              <div className="card-image-box">
                <img src="/images/radar_tracking.png" alt="Real-Time Radar" />
              </div>
              <div className="card-content">
                <div className="service-icon icon-purple">
                  <ClockIcon size={22} color="#7e22ce" />
                </div>
                <h3>Live Disruption Radar</h3>
                <p>Live flight status.</p>
                <span className="card-no">02</span>
              </div>
            </div>

            <div className="service-card">
              <div className="card-image-box">
                <img src="/images/lounge_perks.png" alt="Passenger Priority Portal" />
              </div>
              <div className="card-content">
                <div className="service-icon icon-green">
                  <ShieldIcon size={22} color="#15803d" />
                </div>
                <h3>Passenger Priority Lounge</h3>
                <p>Role-based access system.</p>
                <span className="card-no">03</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS SECTION ================= */}
        <section className="how-section">
          <div className="section-heading">
            <span className="sub-title">SIMPLE 3-STEP PROCESS</span>
            <h2>How SkyRebook Protects Your Journey</h2>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-badge">STEP 01</div>
              <h3>Flight Disruption Occurs</h3>
              <p>Flight delayed or cancelled.</p>
            </div>

            <div className="step-card highlight-step">
              <div className="step-badge">STEP 02</div>
              <h3>Instant Rebook Match</h3>
              <p>Select alternative flight.</p>
            </div>

            <div className="step-card">
              <div className="step-badge">STEP 03</div>
              <h3>E-Boarding Pass Issued</h3>
              <p>Get e-boarding pass.</p>
            </div>
          </div>
        </section>

      
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="home-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <PlaneIcon size={22} color="#ffffff" />
              </div>
              <div>
                <h3>SkyRebook</h3>
                <span>Emergency Flight Assistance System</span>
              </div>
            </div>
            <p>Emergency flight rebooking platform.</p>
          </div>

          <div className="footer-column">
            <h4>Navigation</h4>
            <button onClick={() => onNavigate("home")}>Home</button>
            <button onClick={() => onNavigate("about")}>About Platform</button>
            <button onClick={() => onNavigate("register")}>Register</button>
            <button onClick={() => onNavigate("login")}>Login</button>
          </div>

          <div className="footer-column">
            <h4>Quick Portals</h4>
            <button onClick={() => onNavigate("login")}>Passenger Portal</button>
            <button onClick={() => onNavigate("login")}>Admin Dashboard</button>
            <button onClick={() => onNavigate("about")}>Architecture Specs</button>
          </div>

          <div className="footer-column contact-column">
            <h4>Support Desk</h4>
            <p><MailIcon size={14} /> support@skyrebook.com</p>
            <p><PhoneIcon size={14} /> +1 (800) 555-0123</p>
            <span className="availability">● 24/7 Airport Support Active</span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 SkyRebook Platform. All rights reserved.</span>
          <div>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;