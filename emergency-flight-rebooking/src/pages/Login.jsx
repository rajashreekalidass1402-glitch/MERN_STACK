import { useState } from "react";
import "./Login.css";
import { 
  PlaneIcon, 
  ZapIcon, 
  ShieldIcon, 
  ClockIcon, 
  MailIcon, 
  LockIcon, 
  EyeIcon, 
  EyeOffIcon, 
  ArrowRightIcon
} from "../components/Icons";

function Login({ onRegister, onBackToHome, onNavigate, onLoginSuccess }) {
  const storedUser = JSON.parse(localStorage.getItem("skyrebookUser"));
  const [email, setEmail] = useState(storedUser?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    if (email.trim().toLowerCase() === "admin@123" && password === "123") {
      const adminUser = {
        name: "System Admin",
        email: "admin@123",
        role: "admin",
      };
      localStorage.setItem("skyrebookUser", JSON.stringify(adminUser));
      localStorage.setItem("skyrebookRole", "admin");
      onLoginSuccess("admin");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("skyrebookToken", data.token);
      }
      if (data.user) {
        localStorage.setItem("skyrebookUser", JSON.stringify(data.user));
        localStorage.setItem("skyrebookRole", data.user.role || "passenger");
      }

      setLoading(false);
      onLoginSuccess(data.user?.role || "passenger");
    } catch (err) {
      console.error("Login error:", err);

      const registeredUser = JSON.parse(localStorage.getItem("skyrebookUser"));
      if (
        registeredUser &&
        registeredUser.email.toLowerCase() === email.trim().toLowerCase()
      ) {
        localStorage.setItem("skyrebookRole", "passenger");
        onLoginSuccess("passenger");
        return;
      }

      setError("Cannot connect to server. Please make sure backend is running.");
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="logo" onClick={onBackToHome}>
          <div className="logo-icon">
            <PlaneIcon size={22} color="#ffffff" />
          </div>
          <div>
            <h2>SkyRebook</h2>
            <span>Emergency Flight Portal</span>
          </div>
        </div>

        <nav className="home-nav">
          <button className="nav-link" onClick={() => onNavigate ? onNavigate("home") : onBackToHome()}>Home</button>
          <button className="nav-link" onClick={() => onNavigate ? onNavigate("about") : null}>About</button>
          <button className="nav-link active" onClick={() => onNavigate ? onNavigate("login") : null}>Login</button>
        </nav>
      </header>

      {/* MAIN CONTAINER */}
      <main className="main-container">
        {/* LEFT HERO INTRO */}
        <section className="intro-section">
          <div className="badge">
            <span className="live-dot"></span>
             Passenger & Admin Login
          </div>

          <h1>
            Welcome back.
            <span>Your journey continues here.</span>
          </h1>

          <p>Sign in to continue.</p>

          <div className="features">
            <div className="feature">
              <div className="feature-icon icon-blue">
                <ZapIcon size={20} color="#2563eb" />
              </div>
              <div>
                <h3>Fast Emergency Rebooking</h3>
                <p>Quick seat allocation.</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon icon-green">
                <ShieldIcon size={20} color="#16a34a" />
              </div>
              <div>
                <h3>Encrypted & Verified</h3>
                <p>Instant PNR lookup.</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon icon-purple">
                <ClockIcon size={20} color="#7c3aed" />
              </div>
              <div>
                <h3>24/7 Operations Desk</h3>
                <p>Live status updates.</p>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT LOGIN CARD */}
        <section className="login-section">
          <div className="login-card">
            <div className="login-heading">
              <h2>Sign in to SkyRebook</h2>
              <p>Enter account credentials.</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email Address / Admin ID</label>
                <div className="input-with-icon">
                  <MailIcon size={18} color="#64748b" className="field-icon" />
                  <input
                    type="text"
                    placeholder="Enter your email or admin ID"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="password-label">
                  <label>Password</label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Please contact SkyRebook support or system admin to reset your password.");
                    }}
                  >
                    Forgot password?
                  </a>
                </div>

                <div className="input-with-icon">
                  <LockIcon size={18} color="#64748b" className="field-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                  />
                  <button
                    type="button"
                    className="show-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
              </div>

              {error && <div className="login-error">⚠ {error}</div>}

              <div className="remember">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Remember me on this device</label>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign in to Account
                    <ArrowRightIcon size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="divider">
              <span>New to SkyRebook?</span>
            </div>

            <button type="button" className="create-btn" onClick={onRegister}>
              Create New Passenger Account
            </button>

            <p className="terms">
              By continuing, you agree to our <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Login;