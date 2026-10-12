import { useState } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import PassengerDashboard from "./pages/PassengerDashboard";
function App() {
  const [page, setPage] = useState("home");

  const handleLoginSuccess = (role) => {
    if (role === "admin") {
      setPage("admin");
    } else if (role === "passenger") {
      setPage("passenger");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("skyrebookRole");
    localStorage.removeItem("skyrebookToken");
    localStorage.removeItem("skyrebookUser");
    setPage("home");
  };

  const navigateTo = (target) => {
    setPage(target);
    window.scrollTo(0, 0);
  };

  if (page === "admin") {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (page === "passenger") {
    return <PassengerDashboard onLogout={handleLogout} />;
  }

  if (page === "login") {
    return (
      <Login
        onRegister={() => navigateTo("register")}
        onBackToHome={() => navigateTo("home")}
        onNavigate={navigateTo}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (page === "register") {
    return (
      <Register
        onBackToLogin={() => navigateTo("login")}
        onBackToHome={() => navigateTo("home")}
        onNavigate={navigateTo}
      />
    );
  }

  if (page === "about") {
    return (
      <About
        onNavigate={navigateTo}
      />
    );
  }

  return (
    <Home
      onNavigate={navigateTo}
    />
  );
}

export default App;