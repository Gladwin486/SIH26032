import { useState } from "react";
import "./Register.css";

function Register({ onBackToLogin, onRegistered }) {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    password: "",
    farmer_registration_id: "",
    village: "",
    district: "",
    state: "Tamil Nadu",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.name ||
      !formData.mobile ||
      !formData.password ||
      !formData.farmer_registration_id ||
      !formData.village ||
      !formData.district ||
      !formData.state
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        name: formData.name,
        mobile: formData.mobile,
        password: formData.password,
        role: "farmer",
        farmer_registration_id:
          formData.farmer_registration_id,
        village: formData.village,
        district: formData.district,
        state: formData.state,
      });

      const response = await fetch(
        `http://127.0.0.1:8000/farmers?${params.toString()}`,
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
            : "Registration failed."
        );
      }

      setSuccess(
        "Registration successful! You can now login."
      );

      setFormData({
        name: "",
        mobile: "",
        password: "",
        farmer_registration_id: "",
        village: "",
        district: "",
        state: "Tamil Nadu",
      });

      setTimeout(() => {
        onRegistered();
      }, 1500);

    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* LEFT SIDE */}

      <div className="register-left">

        <div className="register-brand">

          <div className="register-logo">
            SF
          </div>

          <div>
            <h1>Smart Farmer</h1>
            <p>
              Procurement & Queue Management
            </p>
          </div>

        </div>

        <div className="register-intro">

          <span>
            FARMER REGISTRATION
          </span>

          <h2>
            Start your smart
            <br />
            procurement journey.
          </h2>

          <p>
            Create your farmer account to access
            procurement schedules, digital tokens,
            live queue tracking and timely notifications.
          </p>

        </div>

        <div className="register-note">
          <strong>
            One account. One smarter journey.
          </strong>

          <p>
            Your registration details help the
            procurement centre manage your visit efficiently.
          </p>
        </div>

      </div>


      {/* RIGHT SIDE */}

      <div className="register-right">

        <div className="register-card">

          <div className="register-heading">

            <button
              type="button"
              className="back-button"
              onClick={onBackToLogin}
            >
              ← Back to Login
            </button>

            <span>
              CREATE ACCOUNT
            </span>

            <h2>
              Register as Farmer
            </h2>

            <p>
              Enter your details to create your farmer account.
            </p>

          </div>


          <form onSubmit={handleRegister}>

            {/* NAME */}

            <div className="register-form-group">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />

            </div>


            {/* MOBILE */}

            <div className="register-form-group">

              <label>
                Mobile Number
              </label>

              <input
                type="tel"
                name="mobile"
                placeholder="Enter your mobile number"
                value={formData.mobile}
                onChange={handleChange}
                maxLength="15"
              />

            </div>


            {/* PASSWORD */}

            <div className="register-form-group">

              <label>
                Password
              </label>

              <div className="register-password-wrapper">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "◉" : "◌"}
                </button>

              </div>

            </div>


            {/* FARMER ID */}

            <div className="register-form-group">

              <label>
                Farmer Registration ID
              </label>

              <input
                type="text"
                name="farmer_registration_id"
                placeholder="Enter farmer registration ID"
                value={
                  formData.farmer_registration_id
                }
                onChange={handleChange}
              />

            </div>


            {/* LOCATION */}

            <div className="register-location-grid">

              <div className="register-form-group">

                <label>
                  Village / Locality
                </label>

                <input
                  type="text"
                  name="village"
                  placeholder="Enter village"
                  value={formData.village}
                  onChange={handleChange}
                />

              </div>


              <div className="register-form-group">

                <label>
                  District
                </label>

                <input
                  type="text"
                  name="district"
                  placeholder="Enter district"
                  value={formData.district}
                  onChange={handleChange}
                />

              </div>

            </div>


            {/* STATE */}

            <div className="register-form-group">

              <label>
                State
              </label>

              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />

            </div>


            {/* ERROR */}

            {error && (
              <div className="register-error">
                {error}
              </div>
            )}


            {/* SUCCESS */}

            {success && (
              <div className="register-success">
                {success}
              </div>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Farmer Account →"}
            </button>

          </form>


          <div className="register-footer">
            <span>
              Secure Farmer Registration
            </span>

            <span>•</span>

            <span>
              SIH26032
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;