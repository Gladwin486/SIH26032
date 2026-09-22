import { useState } from "react";
import "./Login.css";

function Login({ onLogin, onRegister }) {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!mobile || !password) {
      setError("Please enter your mobile number and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/farmer-login?mobile=${encodeURIComponent(
          mobile
        )}&password=${encodeURIComponent(password)}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          const messages = data.detail
            .map((item) => item.msg)
            .join(", ");

          throw new Error(messages);
        }

        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Login failed"
        );
      }

      if (data.role !== "farmer") {
        setError("This login is not registered as a farmer.");
        return;
      }

      onLogin(data);
    } catch (err) {
      setError(
        err.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* ================= LEFT FARMER SECTION ================= */}

      <div className="farmer-section">

        <div className="farmer-overlay"></div>

        <div className="farmer-content">

          <div className="brand">
            <div className="brand-logo">SF</div>

            <div>
              <h1>Smart Farmer</h1>
              <p>Procurement & Queue Management</p>
            </div>
          </div>

          <div className="farmer-message">

            <div className="small-title">
              SMART PROCUREMENT PLATFORM
            </div>

            <h2>
              From your field
              <br />
              to <span>fair procurement.</span>
            </h2>

            <p>
              Plan your visit, get a digital token
              and track your procurement journey.
            </p>

            <div className="quick-features">
              <div>
                <strong>01</strong>
                <span>Digital Token</span>
              </div>

              <div>
                <strong>02</strong>
                <span>Live Queue</span>
              </div>

              <div>
                <strong>03</strong>
                <span>Smart Alerts</span>
              </div>
            </div>

          </div>

          <div className="farmer-bottom">
            <span>Empowering Farmers</span>
           
          </div>

        </div>
      </div>


      {/* ================= LOGIN SECTION ================= */}

      <div className="login-section">

        <div className="login-card">

          <div className="mobile-brand">
            <div className="mobile-logo">SF</div>

            <div>
              <strong>Smart Farmer</strong>
              <span>Procurement Platform</span>
            </div>
          </div>


          <div className="login-heading">

            <div className="login-label">
              FARMER PORTAL
            </div>

            <h2>Welcome back</h2>

            <p>
              Sign in to continue to your dashboard.
            </p>

          </div>


          <form onSubmit={handleLogin}>

            {/* MOBILE */}

            <div className="input-group">

              <label>Mobile Number</label>

              <div className="input-wrapper">

                <span className="input-icon">☎</span>

                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  maxLength="15"
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="input-group">

              <label>Password</label>

              <div className="input-wrapper">

                <span className="input-icon">●</span>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>


            {/* ERROR */}

            {error && (
              <div className="error-message">
                <span>!</span>
                {error}
              </div>
            )}


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span className="arrow">→</span>
                </>
              )}
            </button>

          </form>


          {/* REGISTER */}

          <div className="register-area">

            <span>New to the platform?</span>

            <button
              type="button"
              onClick={onRegister}
            >
              Register as Farmer
              <span>→</span>
            </button>

          </div>


          {/* FOOTER */}

          <div className="login-footer">

            <span className="secure-icon">✓</span>

            <span>Secure Farmer Access</span>

            <span className="dot">•</span>

            

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;