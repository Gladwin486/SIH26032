import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import FarmerDashboard from "./FarmerDashboard";
import OfficerDashboard from "./OfficerDashboard";
import TokenBooking from "./TokenBooking";

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("login");
  const [view, setView] = useState("farmer");

  // ---------------------------------------------
  // LOGIN
  // ---------------------------------------------
  const handleLogin = (data) => {
    setUser(data);
    setPage("dashboard");
    setView("farmer");
  };

  // ---------------------------------------------
  // LOGOUT
  // ---------------------------------------------
  const handleLogout = () => {
    setUser(null);
    setPage("login");
    setView("farmer");
  };

  // ---------------------------------------------
  // REGISTER
  // ---------------------------------------------
  const handleRegisterPage = () => {
    setPage("register");
  };

  const handleRegistered = () => {
    setPage("login");
  };

  const handleBackToLogin = () => {
    setPage("login");
  };

  // ---------------------------------------------
  // TOKEN BOOKING
  // ---------------------------------------------
  const openTokenBooking = () => {
    setView("tokenBooking");
  };

  const backToFarmerDashboard = () => {
    setView("farmer");
  };

  const tokenGenerated = () => {
    setView("farmer");
  };

  // ---------------------------------------------
  // LOGIN PAGE
  // ---------------------------------------------
  if (page === "login") {
    return (
      <Login
        onLogin={handleLogin}
        onRegister={handleRegisterPage}
      />
    );
  }

  // ---------------------------------------------
  // REGISTER PAGE
  // ---------------------------------------------
  if (page === "register") {
    return (
      <Register
        onBackToLogin={handleBackToLogin}
        onRegistered={handleRegistered}
      />
    );
  }

  // ---------------------------------------------
  // DIGITAL TOKEN BOOKING
  // ---------------------------------------------
  if (view === "tokenBooking") {
    return (
      <TokenBooking
        farmerId={user?.farmer_id}
        onBack={backToFarmerDashboard}
        onTokenGenerated={tokenGenerated}
      />
    );
  }

  // ---------------------------------------------
  // FARMER DASHBOARD
  // ---------------------------------------------
  if (view === "farmer") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f5f7f6",
        }}
      >
        {/* TOP ACTION BAR */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "10px",
            padding: "12px 24px",
            background: "#ffffff",
            borderBottom: "1px solid #e4e9e6",
            position: "relative",
            zIndex: 20,
          }}
        >
          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 18px",
              border: "1px solid #dce5df",
              borderRadius: "8px",
              background: "#ffffff",
              color: "#166534",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Logout
          </button>

          {/* OFFICER DASHBOARD */}
          <button
            onClick={() => setView("officer")}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "8px",
              background: "#166534",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Officer Dashboard →
          </button>
        </div>

        {/* FARMER DASHBOARD */}
        <FarmerDashboard
          farmerId={user?.farmer_id}
          onGenerateToken={openTokenBooking}
        />
      </div>
    );
  }

  // ---------------------------------------------
  // OFFICER DASHBOARD
  // ---------------------------------------------
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7f6",
      }}
    >
      {/* OFFICER TOP BAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          background: "#ffffff",
          borderBottom: "1px solid #e4e9e6",
        }}
      >
        {/* FARMER DASHBOARD */}
        <button
          onClick={() => setView("farmer")}
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: "8px",
            background: "#166534",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          ← Farmer Dashboard
        </button>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 18px",
            border: "1px solid #dce5df",
            borderRadius: "8px",
            background: "#ffffff",
            color: "#166534",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* OFFICER DASHBOARD */}
      <OfficerDashboard />
    </div>
  );
}

export default App;