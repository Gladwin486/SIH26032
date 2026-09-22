import { useState } from "react";
import "./TokenBooking.css";

function TokenBooking({
  farmerId,
  onTokenGenerated,
  onBack,
}) {
  const [crop, setCrop] = useState("paddy");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  // Current working procurement centre
  const centreId = 1;

  // Current working procurement schedule
  const scheduleId = 1;

  const handleGenerateToken = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(null);

    if (!crop) {
      setError("Please select a crop.");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
  farmer_id: farmerId,
  centre_id: centreId,
  schedule_id: scheduleId,
  crop: crop,
});

      const response = await fetch(
        `http://127.0.0.1:8000/tokens?${params.toString()}`,
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
            : "Unable to generate token."
        );
      }

      if (
        data.message &&
        data.message !==
          "Digital token generated successfully"
      ) {
        throw new Error(
          data.message
        );
      }

      setSuccess(data);

    } catch (err) {
      console.error(
        "Token generation error:",
        err
      );

      setError(
        err.message ||
          "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // SUCCESS SCREEN
  // --------------------------------------------------
  if (success) {
    return (
      <div className="token-booking-page">

        <div className="token-success-card">

          <div className="token-success-icon">
            ✓
          </div>

          <span className="token-success-label">
            DIGITAL TOKEN GENERATED
          </span>

          <h1>
            Token Generated Successfully
          </h1>

          <p className="token-success-description">
            Your procurement queue token has
            been generated successfully.
          </p>

          <div className="generated-token-box">

            <span>
              YOUR TOKEN NUMBER
            </span>

            <strong>
              {success.token_number}
            </strong>

          </div>

          <div className="generated-token-details">

            <div>
              <span>
                QUEUE POSITION
              </span>

              <strong>
                {success.queue_position}
              </strong>
            </div>

            <div>
              <span>
                STATUS
              </span>

              <strong>
                {success.status}
              </strong>
            </div>

          </div>

          <div className="token-success-note">
            <span>●</span>

            <p>
              Your current queue position is{" "}
              <strong>
                {success.queue_position}
              </strong>.
              You can track your position and
              estimated waiting time from your
              Farmer Dashboard.
            </p>
          </div>

          <button
            type="button"
            className="go-dashboard-button"
            onClick={() => {
              if (onTokenGenerated) {
                onTokenGenerated(success);
              }
            }}
          >
            Go to Farmer Dashboard →
          </button>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // BOOKING PAGE
  // --------------------------------------------------
  return (
    <div className="token-booking-page">

      {/* HEADER */}
      <div className="token-booking-header">

        <button
          type="button"
          className="token-back-button"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>

        <div className="token-header-brand">
          <div className="token-brand-logo">
            SP
          </div>

          <div>
            <h1>
              Smart Procurement
            </h1>

            <p>
              Digital Token Booking
            </p>
          </div>
        </div>

        <div className="token-header-id">
          Farmer ID #{farmerId}
        </div>

      </div>

      {/* MAIN */}
      <main className="token-booking-main">

        <div className="token-page-intro">

          <span>
            DIGITAL TOKEN
          </span>

          <h2>
            Book your procurement slot
          </h2>

          <p>
            Generate a digital queue token
            before visiting the procurement centre.
          </p>

        </div>

        <div className="token-booking-grid">

          {/* LEFT INFORMATION */}
          <section className="token-info-panel">

            <div className="token-info-top">
              <span>
                SMART QUEUE MANAGEMENT
              </span>

              <h3>
                Skip unnecessary waiting.
              </h3>

              <p>
                Generate your token online and
                monitor your queue position from
                your Farmer Dashboard.
              </p>
            </div>

            <div className="token-info-steps">

              <div className="token-info-step">

                <div>
                  01
                </div>

                <section>
                  <strong>
                    Select your crop
                  </strong>

                  <p>
                    Choose the crop you want
                    to submit for procurement.
                  </p>
                </section>

              </div>

              <div className="token-info-step">

                <div>
                  02
                </div>

                <section>
                  <strong>
                    Generate token
                  </strong>

                  <p>
                    Get your digital queue
                    position instantly.
                  </p>
                </section>

              </div>

              <div className="token-info-step">

                <div>
                  03
                </div>

                <section>
                  <strong>
                    Track your turn
                  </strong>

                  <p>
                    Monitor queue status and
                    estimated waiting time.
                  </p>
                </section>

              </div>

            </div>

          </section>

          {/* RIGHT FORM */}
          <section className="token-form-card">

            <div className="token-form-heading">

              <span>
                PROCUREMENT DETAILS
              </span>

              <h3>
                Generate Digital Token
              </h3>

              <p>
                Confirm your procurement details
                before generating the token.
              </p>

            </div>

            <form
              onSubmit={
                handleGenerateToken
              }
            >

              {/* CENTRE */}
              <div className="token-form-group">

                <label>
                  Procurement Centre
                </label>

                <div className="token-readonly-field">

                  <div className="token-field-icon">
                    C
                  </div>

                  <div>
                    <strong>
                      Thoothukudi Procurement Centre
                    </strong>

                    <span>
                      Thoothukudi
                    </span>
                  </div>

                </div>

              </div>

              {/* CROP */}
              <div className="token-form-group">

                <label>
                  Select Crop
                </label>

                <select
                  value={crop}
                  onChange={(e) =>
                    setCrop(
                      e.target.value
                    )
                  }
                >
                  <option value="paddy">
                    Paddy
                  </option>

                  <option value="wheat">
                    Wheat
                  </option>

                  <option value="rice">
                    Rice
                  </option>

                  <option value="maize">
                    Maize
                  </option>

                  <option value="cotton">
                    Cotton
                  </option>

                  <option value="sugarcane">
                    Sugarcane
                  </option>
                </select>

              </div>

              {/* SCHEDULE */}
              <div className="token-form-group">

                <label>
                  Procurement Schedule
                </label>

                <div className="token-schedule-box">

                  <div className="schedule-date">
                    <strong>
                      06
                    </strong>

                    <span>
                      SEP
                    </span>
                  </div>

                  <div className="schedule-info">

                    <strong>
                      Scheduled Procurement
                    </strong>

                    <span>
                      06 September 2026
                    </span>

                    <small>
                      9.00 AM - 4.00 PM
                    </small>

                  </div>

                  <div className="schedule-status">
                    OPEN
                  </div>

                </div>

              </div>

              {/* ERROR */}
              {error && (
                <div className="token-error">
                  <span>!</span>
                  {error}
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                className="generate-token-button"
                disabled={loading}
              >
                {loading
                  ? "Generating Token..."
                  : "Generate Digital Token →"}
              </button>

              <p className="token-form-footer">
                By generating a token, you confirm
                that the selected procurement details
                are correct.
              </p>

            </form>

          </section>

        </div>

      </main>

    </div>
  );
}

export default TokenBooking;