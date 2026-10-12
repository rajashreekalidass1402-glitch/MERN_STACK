import "./Home.css";
import { 
  PlaneIcon, 
  ShieldIcon, 
  ZapIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  MailIcon, 
  PhoneIcon 
} from "../components/Icons";

function About({ onNavigate }) {
  return (
    <div className="home-page">

      {/* NAVBAR */}
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
          <button className="nav-link" onClick={() => onNavigate("home")}>Home</button>
          <button className="nav-link active" onClick={() => onNavigate("about")}>About</button>
          <button className="nav-link" onClick={() => onNavigate("login")}>Login</button>
        </nav>
      </header>

      {/* ABOUT HERO */}
      <section className="hero-section" style={{ paddingBottom: "40px" }}>
        <div className="hero-content">
          <span className="hero-badge">
            <span className="pulse-dot"></span>
            SYSTEM SPECIFICATION & ARCHITECTURE
          </span>

          <h1>
            Transforming Flight Disruption
            <br />
            <span className="gradient-text">Into Seamless Rebooking.</span>
          </h1>

          <p>Emergency flight rebooking platform.</p>
        </div>

        <div className="hero-visual">
          <div className="single-image-card">
            <div className="image-wrapper" style={{ height: "300px" }}>
              <img src="/images/radar_tracking.png" alt="Radar Tracking System" className="main-hero-img" />
              <div className="image-overlay-gradient"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES & TECH STACK */}
      <section className="services-section">
        <div className="section-heading">
          <span className="sub-title">TECHNICAL ARCHITECTURE</span>
          <h2>Built for Reliability & Speed</h2>
          <p>Fast state synchronization.</p>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <div className="card-content">
              <div className="service-icon icon-blue">
                <ZapIcon size={22} color="#2563eb" />
              </div>
              <h3>Instant State Engine</h3>
              <p>Synced state management.</p>
            </div>
          </div>

          <div className="service-card">
            <div className="card-content">
              <div className="service-icon icon-purple">
                <ShieldIcon size={22} color="#7e22ce" />
              </div>
              <h3>Role-Based Access Control</h3>
              <p>Role-based access control.</p>
            </div>
          </div>

          <div className="service-card">
            <div className="card-content">
              <div className="service-icon icon-green">
                <ClockIcon size={22} color="#15803d" />
              </div>
              <h3>E-Boarding Pass Generator</h3>
              <p>Digital boarding pass renderer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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
            <p>Emergency passenger assistance platform.</p>
          </div>

          <div className="footer-column">
            <h4>Navigation</h4>
            <button onClick={() => onNavigate("home")}>Home</button>
            <button onClick={() => onNavigate("about")}>About Platform</button>
            <button onClick={() => onNavigate("register")}>Register</button>
            <button onClick={() => onNavigate("login")}>Login</button>
          </div>

          <div className="footer-column">
            <h4>Support</h4>
            <button onClick={() => onNavigate("login")}>Passenger Portal</button>
            <button onClick={() => onNavigate("login")}>Admin Dashboard</button>
          </div>

          <div className="footer-column contact-column">
            <h4>Contact Desk</h4>
            <p><MailIcon size={14} /> support@skyrebook.com</p>
            <p><PhoneIcon size={14} /> +1 (800) 555-0123</p>
            <span className="availability">● 24/7 Live Monitoring Active</span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 SkyRebook. All rights reserved.</span>
          <div>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default About;