import { useState } from "react";
import "./Register.css";
import {
  PlaneIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  LockIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "../components/Icons";

function Register({ onBackToLogin, onBackToHome, onNavigate }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
    setError("");
  };

  const getPasswordStrength = () => {
    const p = formData.password;

    if (!p) return null;

    if (p.length < 6) {
      return {
        label: "Weak",
        class: "weak",
        width: "33%",
      };
    }

    if (p.length < 10) {
      return {
        label: "Medium",
        class: "medium",
        width: "66%",
      };
    }

    return {
      label: "Strong",
      class: "strong",
      width: "100%",
    };
  };

  const strength = getPasswordStrength();

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
    } = formData;

    // Basic validation
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        setLoading(false);
        return;
      }

      // Save only safe user information in localStorage
      if (data.user) {
        localStorage.setItem(
          "skyrebookUser",
          JSON.stringify(data.user)
        );
      }

      setMessage(
        "Registration successful! Your account has been created."
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      setLoading(false);

      // Go to login after successful registration
      setTimeout(() => {
        onBackToLogin();
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        "Cannot connect to server. Please make sure the backend is running."
      );

      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* NAVBAR */}
      <header className="register-navbar">
        <div
          className="register-logo"
          onClick={onBackToHome}
        >
          <div className="register-logo-icon">
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
          <button className="nav-link" onClick={() => onNavigate ? onNavigate("login") : onBackToLogin()}>Login</button>
        </nav>
      </header>

      {/* MAIN CONTAINER */}
      <main className="register-container">
        <div className="register-card">

          {/* HEADING */}
          <div className="register-heading">
            <span className="register-small-label">
              PASSENGER REGISTRATION • MINI PROJECT
            </span>

            <h1>Create Your Account</h1>

            <p>Create free passenger account.</p>
          </div>

          {/* REGISTER FORM */}
          <form onSubmit={handleRegister}>

            {/* NAME + PHONE */}
            <div className="form-row">

              <div className="register-field">
                <label>Full Name</label>

                <div className="input-with-icon">
                  <UserIcon
                    size={18}
                    color="#64748b"
                    className="field-icon"
                  />

                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Gokul Kumar"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="register-field">
                <label>Phone Number</label>

                <div className="input-with-icon">
                  <PhoneIcon
                    size={18}
                    color="#64748b"
                    className="field-icon"
                  />

                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

            </div>

            {/* EMAIL */}
            <div className="register-field">
              <label>Email Address</label>

              <div className="input-with-icon">
                <MailIcon
                  size={18}
                  color="#64748b"
                  className="field-icon"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* PASSWORD + CONFIRM PASSWORD */}
            <div className="form-row">

              <div className="register-field">
                <label>Password</label>

                <div className="input-with-icon">
                  <LockIcon
                    size={18}
                    color="#64748b"
                    className="field-icon"
                  />

                  <input
                    type="password"
                    name="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="register-field">
                <label>Confirm Password</label>

                <div className="input-with-icon">
                  <LockIcon
                    size={18}
                    color="#64748b"
                    className="field-icon"
                  />

                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

            </div>

            {/* PASSWORD STRENGTH */}
            {strength && (
              <div className="strength-meter">

                <div className="strength-bar-bg">
                  <div
                    className={`strength-bar ${strength.class}`}
                    style={{
                      width: strength.width,
                    }}
                  ></div>
                </div>

                <span className="strength-text">
                  Password Security:{" "}
                  <strong>{strength.label}</strong>
                </span>

              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="register-error">
                ⚠ {error}
              </div>
            )}

            {/* SUCCESS MESSAGE */}
            {message && (
              <div className="register-message">
                <CheckCircleIcon
                  size={16}
                  color="#15803d"
                />

                {message}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading ? (
                "Creating Account..."
              ) : (
                <>
                  Create Passenger Account
                  <ArrowRightIcon size={18} />
                </>
              )}
            </button>

          </form>

          {/* LOGIN LINK */}
          <div className="login-link">
            Already have an account?{" "}

            <button
              type="button"
              onClick={onBackToLogin}
            >
              Sign In Here
            </button>
          </div>

        </div>
      </main>

    </div>
  );
}

export default Register;