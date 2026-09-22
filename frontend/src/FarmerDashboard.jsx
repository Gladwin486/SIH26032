import { useEffect, useState } from "react";
import "./FarmerDashboard.css";

function FarmerDashboard({
  farmerId,
  tokenId = null,
  onGenerateToken,
}) {
  const [dashboard, setDashboard] = useState(null);
  const [waitTime, setWaitTime] = useState(null);

  const [procurementStatus, setProcurementStatus] =
    useState(null);

  const [procurementLoading, setProcurementLoading] =
    useState(true);

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [markingRead, setMarkingRead] =
    useState(false);

  const [error, setError] =
    useState("");

  // --------------------------------------------------
  // LOAD DASHBOARD
  // --------------------------------------------------
  const loadDashboard = async () => {
    if (!farmerId) {
      return;
    }

    try {
      const dashboardResponse = await fetch(
        `http://127.0.0.1:8000/farmer/dashboard/${farmerId}${
          tokenId
            ? `?token_id=${tokenId}&_=${Date.now()}`
            : `?_=${Date.now()}`
        }`,
        {
          cache: "no-store",
        }
      );

      if (!dashboardResponse.ok) {
        throw new Error(
          "Dashboard loading failed"
        );
      }

      const dashboardData =
        await dashboardResponse.json();

      setDashboard(dashboardData);

      // --------------------------------------------------
      // LOAD WAIT TIME
      // --------------------------------------------------
      if (dashboardData.token_id) {
        const waitResponse = await fetch(
          `http://127.0.0.1:8000/queue/${dashboardData.token_id}/wait-time?_=${Date.now()}`,
          {
            cache: "no-store",
          }
        );

        if (waitResponse.ok) {
          const waitData =
            await waitResponse.json();

          setWaitTime(waitData);
        } else {
          setWaitTime(null);
        }

        // --------------------------------------------------
        // LOAD LATEST PROCUREMENT STAGES
        // --------------------------------------------------
        const procurementResponse =
          await fetch(
            `http://127.0.0.1:8000/procurement-status/${dashboardData.token_id}?_=${Date.now()}`,
            {
              cache: "no-store",
            }
          );

        if (procurementResponse.ok) {
          const procurementData =
            await procurementResponse.json();

          if (
            procurementData.message !==
            "Procurement record not found"
          ) {
            setProcurementStatus(
              procurementData
            );
          } else {
            setProcurementStatus(null);
          }
        } else {
          setProcurementStatus(null);
        }
      } else {
        setWaitTime(null);
        setProcurementStatus(null);
      }

      setError("");
    } catch (err) {
      console.error(
        "Dashboard loading failed:",
        err
      );

      setError(
        err.message ||
          "Unable to load farmer dashboard."
      );
    } finally {
      setLoading(false);
      setProcurementLoading(false);
    }
  };

  // --------------------------------------------------
  // LOAD NOTIFICATIONS
  // --------------------------------------------------
  const loadNotifications = async () => {
    if (!farmerId) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/notifications/${farmerId}?_=${Date.now()}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load notifications."
        );
      }

      const data =
        await response.json();

      let notificationList = [];

      if (Array.isArray(data)) {
        notificationList = data;
      } else if (
        Array.isArray(data.notifications)
      ) {
        notificationList =
          data.notifications;
      }

      setNotifications(
        notificationList
      );
    } catch (err) {
      console.error(
        "Notification loading failed:",
        err
      );
    }
  };

  // --------------------------------------------------
  // LOAD PROCUREMENT STATUS
  // --------------------------------------------------
  const loadProcurementStatus = async () => {
    if (!dashboard?.token_id) {
      return;
    }

    try {
      setProcurementLoading(true);

      const response = await fetch(
        `http://127.0.0.1:8000/procurement-status/${dashboard.token_id}?_=${Date.now()}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load procurement status."
        );
      }

      const data =
        await response.json();

      if (
        data.message ===
        "Procurement record not found"
      ) {
        setProcurementStatus(null);
        return;
      }

      setProcurementStatus(data);
    } catch (err) {
      console.error(
        "Procurement status loading failed:",
        err
      );

      setProcurementStatus(null);
    } finally {
      setProcurementLoading(false);
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD + AUTO REFRESH
  // --------------------------------------------------
  useEffect(() => {
    loadDashboard();
    loadNotifications();

    const interval =
      setInterval(() => {
        loadDashboard();
        loadNotifications();
      }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [farmerId, tokenId]);

  // --------------------------------------------------
  // LOAD PROCUREMENT STATUS
  // --------------------------------------------------
  useEffect(() => {
    if (!dashboard?.token_id) {
      return;
    }

    loadProcurementStatus();

    const interval =
      setInterval(() => {
        loadProcurementStatus();
      }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [dashboard?.token_id]);

  // --------------------------------------------------
  // MARK ALL NOTIFICATIONS AS READ
  // --------------------------------------------------
  const handleMarkAllAsRead = async () => {
    if (!farmerId || markingRead) {
      return;
    }

    setMarkingRead(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/notifications/${farmerId}/read`,
        {
          method: "PUT",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to mark notifications as read."
        );
      }

      setNotifications(
        (previous) =>
          previous.map(
            (notification) => ({
              ...notification,
              is_read: true,
            })
          )
      );
    } catch (err) {
      console.error(
        "Mark all as read error:",
        err
      );

      alert(
        err.message ||
          "Unable to mark notifications as read."
      );
    } finally {
      setMarkingRead(false);
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="farmer-dashboard-loading">
        <div className="loading-spinner"></div>

        <p>
          Loading Farmer Dashboard...
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------
  if (error && !dashboard) {
    return (
      <div className="farmer-dashboard-error">
        <div className="error-card">

          <h2>
            Unable to load dashboard
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              loadDashboard();
              loadNotifications();
            }}
          >
            Try Again
          </button>

        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // SAFE VALUES
  // --------------------------------------------------
  const tokenNumber =
    dashboard?.token_number ||
    "--";

  const status =
    dashboard?.status ||
    "Waiting";

  const queuePosition =
    dashboard?.queue_position ??
    "--";

  const estimatedWait =
    waitTime?.estimated_wait_minutes ??
    dashboard?.estimated_wait_minutes ??
    "--";

  const centreName =
    dashboard?.centre_name ||
    "Procurement Centre";

  const centreLocation =
    dashboard?.centre_location ||
    "--";

  const crop =
    dashboard?.crop ||
    "--";

  const appointmentDate =
    dashboard?.date ||
    "--";

  const startTime =
    dashboard?.start_time ||
    "--";

  const endTime =
    dashboard?.end_time ||
    "--";

  // --------------------------------------------------
  // UNREAD COUNT
  // --------------------------------------------------
  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  // --------------------------------------------------
  // STATUS HELPERS
  // --------------------------------------------------
  const normalizedStatus =
    String(status)
      .trim()
      .toLowerCase();

  const isWaiting =
    normalizedStatus ===
    "waiting";

  const isProcessing =
    normalizedStatus ===
    "processing";

  const isCompleted =
    normalizedStatus ===
    "completed";

  // --------------------------------------------------
  // PROCUREMENT STATUS
  // --------------------------------------------------
  const verificationStatus =
    procurementStatus
      ?.verification_status ||
    "Pending";

  const qualityStatus =
    procurementStatus
      ?.quality_status ||
    "Pending";

  const weighingStatus =
    procurementStatus
      ?.weighing_status ||
    "Pending";

  const procurementStageStatus =
    procurementStatus
      ?.procurement_status ||
    "Pending";

  const paymentStatus =
    procurementStatus
      ?.payment_status ||
    "Pending";

  // --------------------------------------------------
  // STATUS LABEL
  // --------------------------------------------------
  const displayStatus =
    status || "Waiting";

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  return (
    <div className="farmer-dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}
      <header className="farmer-header">

        <div className="farmer-brand">

          <div className="farmer-brand-logo">
            SP
          </div>

          <div>
            <h1>
              Smart Procurement
            </h1>

            <p>
              Farmer Services Portal
            </p>
          </div>

        </div>

        <div className="farmer-header-right">

          <div className="live-system-pill">
            <span className="live-dot"></span>
            Live System
          </div>

          <div className="notification-header-icon">
            <span>•</span>

            {unreadCount > 0 && (
              <strong>
                {unreadCount}
              </strong>
            )}
          </div>

          <div className="farmer-profile">

            <div className="farmer-profile-avatar">
              F
            </div>

            <div>
              <strong>
                Farmer
              </strong>

              <span>
                Farmer ID #{farmerId}
              </span>
            </div>

          </div>

        </div>

      </header>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}
      <main className="farmer-dashboard-main">

        {/* =================================================
            INTRO
        ================================================= */}
        <section className="page-intro">

          <div>

            <span>
              FARMER DASHBOARD
            </span>

            <h2>
              Welcome back
            </h2>

            <p>
              Monitor your procurement appointment,
              queue position and processing status
              from one place.
            </p>

            <button
              type="button"
              className="generate-token-dashboard-button"
              onClick={onGenerateToken}
            >
              + Generate Digital Token
            </button>

          </div>

          <div className="system-status">
            <span className="status-dot"></span>
            System operational
          </div>

        </section>


        {/* =================================================
            CURRENT TOKEN HERO
        ================================================= */}
        <section className="queue-hero">

          <div className="tn-emblem">

            <img
              src="/tn-government-emblem.png"
              alt="Government of Tamil Nadu emblem"
            />

          </div>

          <div className="queue-hero-main">

            <span className="queue-hero-label">
              CURRENT PROCUREMENT TOKEN
            </span>

            <strong className="queue-token">
              {tokenNumber}
            </strong>

            <div
              className={`queue-status ${normalizedStatus}`}
            >
              <span></span>
              {displayStatus}
            </div>

          </div>


          <div className="queue-hero-stats">

            {/* QUEUE POSITION */}
            <div className="queue-stat">

              <span>
                QUEUE POSITION
              </span>

              <strong>
                {isWaiting
                  ? queuePosition
                  : 0}
              </strong>

              <small>
                {isWaiting
                  ? "Current position"
                  : "No longer waiting"}
              </small>

            </div>


            {/* WAIT / PROCESSING */}
            <div className="queue-stat">

              {isWaiting ? (
                <>

                  <span>
                    ESTIMATED WAIT
                  </span>

                  <strong>
                    {estimatedWait}

                    <small className="minute-unit">
                      min
                    </small>
                  </strong>

                  <small>
                    Approximate waiting time
                  </small>

                </>
              ) : isProcessing ? (
                <>

                  <span>
                    PROCESSING
                  </span>

                  <strong>
                    In Progress
                  </strong>

                  <small>
                    Your procurement is being processed
                  </small>

                </>
              ) : isCompleted ? (
                <>

                  <span>
                    PROCESSING
                  </span>

                  <strong>
                    Completed
                  </strong>

                  <small>
                    Procurement process completed
                  </small>

                </>
              ) : (
                <>

                  <span>
                    STATUS
                  </span>

                  <strong>
                    {displayStatus}
                  </strong>

                  <small>
                    Current procurement status
                  </small>

                </>
              )}

            </div>

          </div>

        </section>


        {/* =================================================
            OVERVIEW CARDS
        ================================================= */}
        <section className="overview-grid">

          {/* CENTRE */}
          <div className="overview-card">

            <div className="overview-icon">
              C
            </div>

            <div>

              <span>
                PROCUREMENT CENTRE
              </span>

              <strong>
                {centreName}
              </strong>

              <p>
                {centreLocation}
              </p>

            </div>

          </div>


          {/* CROP */}
          <div className="overview-card">

            <div className="overview-icon">
              A
            </div>

            <div>

              <span>
                CROP
              </span>

              <strong>
                {crop}
              </strong>

              <p>
                Selected for procurement
              </p>

            </div>

          </div>


          {/* DATE */}
          <div className="overview-card">

            <div className="overview-icon">
              D
            </div>

            <div>

              <span>
                APPOINTMENT DATE
              </span>

              <strong>
              {new Date().toISOString().split("T")[0]}
              </strong>

              <p>
                {startTime} - {endTime}
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            TWO COLUMN SECTION
        ================================================= */}
        <section className="dashboard-content-grid">


          {/* =================================================
              PROCESSING JOURNEY
          ================================================= */}
          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <span>
                  PROCUREMENT FLOW
                </span>

                <h3>
                  Processing Journey
                </h3>

              </div>

              <span className="panel-status">

                {isCompleted
                  ? "COMPLETED"
                  : isProcessing
                  ? "IN PROGRESS"
                  : "WAITING"}

              </span>

            </div>


            <div className="processing-timeline">


              {/* =================================================
                  FARMER VERIFICATION
              ================================================= */}
              <div
                className={`timeline-item ${
                  verificationStatus
                    .toLowerCase() ===
                  "completed"
                    ? "completed"
                    : "active"
                }`}
              >

                <div className="timeline-number">

                  {verificationStatus
                    .toLowerCase() ===
                  "completed"
                    ? "✓"
                    : "01"}

                </div>

                <div className="timeline-content">

                  <strong>
                    Farmer Verification
                  </strong>

                  <p>
                    {verificationStatus}
                  </p>

                </div>

              </div>


              {/* =================================================
                  QUALITY CHECK
              ================================================= */}
              <div
                className={`timeline-item ${
                  qualityStatus
                    .toLowerCase() ===
                  "completed"
                    ? "completed"
                    : verificationStatus
                        .toLowerCase() ===
                      "completed"
                    ? "active"
                    : ""
                }`}
              >

                <div className="timeline-number">

                  {qualityStatus
                    .toLowerCase() ===
                  "completed"
                    ? "✓"
                    : "02"}

                </div>

                <div className="timeline-content">

                  <strong>
                    Quality Check
                  </strong>

                  <p>
                    {qualityStatus}
                  </p>

                </div>

              </div>


              {/* =================================================
                  WEIGHING
              ================================================= */}
              <div
                className={`timeline-item ${
                  weighingStatus
                    .toLowerCase() ===
                  "completed"
                    ? "completed"
                    : qualityStatus
                        .toLowerCase() ===
                      "completed"
                    ? "active"
                    : ""
                }`}
              >

                <div className="timeline-number">

                  {weighingStatus
                    .toLowerCase() ===
                  "completed"
                    ? "✓"
                    : "03"}

                </div>

                <div className="timeline-content">

                  <strong>
                    Weighing
                  </strong>

                  <p>
                    {weighingStatus}
                  </p>

                </div>

              </div>


              {/* =================================================
                  PROCUREMENT
              ================================================= */}
              <div
                className={`timeline-item ${
                  procurementStageStatus
                    .toLowerCase() ===
                  "completed"
                    ? "completed"
                    : weighingStatus
                        .toLowerCase() ===
                      "completed"
                    ? "active"
                    : ""
                }`}
              >

                <div className="timeline-number">

                  {procurementStageStatus
                    .toLowerCase() ===
                  "completed"
                    ? "✓"
                    : "04"}

                </div>

                <div className="timeline-content">

                  <strong>
                    Procurement
                  </strong>

                  <p>
                    {procurementStageStatus}
                  </p>

                </div>

              </div>


              {/* =================================================
                  PAYMENT
              ================================================= */}
              <div
                className={`timeline-item ${
                  paymentStatus
                    .toLowerCase() ===
                  "paid"
                    ? "completed"
                    : procurementStageStatus
                        .toLowerCase() ===
                      "completed"
                    ? "active"
                    : ""
                }`}
              >

                <div className="timeline-number">

                  {paymentStatus
                    .toLowerCase() ===
                  "paid"
                    ? "✓"
                    : "05"}

                </div>

                <div className="timeline-content">

                  <strong>
                    Payment
                  </strong>

                  <p>
                    {paymentStatus}
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              TOKEN DETAILS
          ================================================= */}
          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <span>
                  APPOINTMENT
                </span>

                <h3>
                  Token details
                </h3>

              </div>

              <div className="token-small-badge">
                {tokenNumber}
              </div>

            </div>


            <div className="token-details-list">

              {/* TOKEN NUMBER */}
              <div className="token-detail-row">

                <span>
                  Token number
                </span>

                <strong>
                  {tokenNumber}
                </strong>

              </div>


              {/* DATE */}
              <div className="token-detail-row">

                <span>
                  Procurement date
                </span>

                <strong>
                  {appointmentDate}
                </strong>

              </div>


              {/* TIME */}
              <div className="token-detail-row">

                <span>
                  Time slot
                </span>

                <strong>
                  {startTime} - {endTime}
                </strong>

              </div>


              {/* POSITION */}
              <div className="token-detail-row">

                <span>
                  Current position
                </span>

                <strong>
                  {isWaiting
                    ? queuePosition
                    : 0}
                </strong>

              </div>


              {/* PAYMENT */}
              <div className="token-detail-row">

                <span>
                  Payment status
                </span>

                <strong>
                  {procurementLoading
                    ? "Loading..."
                    : paymentStatus}
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            ACTION CARD
        ================================================= */}
        <section className="action-card">

          <div>

            <span>
              WHAT YOU NEED TO DO
            </span>

            {/* WAITING */}
            {isWaiting && (
              <>

                <h3>
                  Please be ready for your turn.
                </h3>

                <p>
                  Monitor your queue position and
                  estimated waiting time. Please
                  reach the procurement centre when
                  your turn approaches.
                </p>

              </>
            )}


            {/* PROCESSING */}
            {isProcessing && (
              <>

                <h3>
                  Your turn is now being processed.
                </h3>

                <p>
                  Please proceed to the procurement
                  counter for verification, quality
                  checking and weighing.
                </p>

              </>
            )}


            {/* COMPLETED */}
            {isCompleted && (
              <>

                <h3>
                  Your procurement is completed.
                </h3>

                <p>
                  Your procurement process has been
                  completed successfully.
                </p>

              </>
            )}

          </div>

          <div className="action-status">

            <span className="status-dot"></span>

            {isWaiting
              ? "Waiting"
              : isProcessing
              ? "Processing"
              : isCompleted
              ? "Completed"
              : displayStatus}

          </div>

        </section>


        {/* =================================================
            NOTIFICATIONS
        ================================================= */}
        <section className="notifications-panel">

          <div className="notifications-heading">

            <div>

              <span>
                UPDATES
              </span>

              <h3>
                Notifications
              </h3>

            </div>


            <div className="notification-actions">

              <div className="notification-count">
                {notifications.length}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  className="mark-all-read-button"
                  onClick={
                    handleMarkAllAsRead
                  }
                  disabled={markingRead}
                >
                  {markingRead
                    ? "Marking..."
                    : "Mark all as read"}
                </button>
              )}

            </div>

          </div>


          <div className="notifications-list">

            {notifications.length === 0 ? (

              <div className="empty-notifications">

                <strong>
                  No notifications
                </strong>

                <p>
                  You don't have any updates yet.
                </p>

              </div>

            ) : (

              notifications.map(
                (
                  notification,
                  index
                ) => (

                  <div
                    className={`notification-item ${
                      notification.is_read
                        ? "read"
                        : "unread"
                    }`}
                    key={
                      notification.notification_id ||
                      index
                    }
                  >

                    <div
                      className={`notification-dot ${
                        notification.is_read
                          ? "read"
                          : ""
                      }`}
                    ></div>

                    <div className="notification-content">

                      <strong>
                        {notification.title}
                      </strong>

                      <p>
                        {notification.message}
                      </p>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </section>


        {/* =================================================
            FOOTER
        ================================================= */}
        <footer className="farmer-footer">

          <span>
            Smart Farmer Procurement Platform
          </span>

          <span>
            SIH26032
          </span>

        </footer>

      </main>

    </div>
  );
}

export default FarmerDashboard;