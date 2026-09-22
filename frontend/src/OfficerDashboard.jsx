import { useEffect, useState } from "react";
import "./OfficerDashboard.css";

function OfficerDashboard() {
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const centreId = 1;

  const loadQueue = () => {
    Promise.all([
      fetch(
        `http://127.0.0.1:8000/officer/queue/${centreId}`
      ).then((response) => response.json()),

      fetch(
        `http://127.0.0.1:8000/officer/dashboard/${centreId}`
      ).then((response) => response.json()),
    ])
      .then(([queueData, statsData]) => {
        console.log("Queue Data:", queueData);
        console.log("Dashboard Data:", statsData);

        setQueue(queueData);
        setStats(statsData);
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "Officer dashboard error:",
          error
        );
        setLoading(false);
      });
  };

  useEffect(() => {
    loadQueue();

    const interval = setInterval(
      loadQueue,
      5000
    );

    return () => clearInterval(interval);
  }, []);

  const startProcessing = async (tokenId) => {
    try {
      setUpdating(tokenId);

      const response = await fetch(
        `http://127.0.0.1:8000/tokens/${tokenId}/status?status=Processing`,
        {
          method: "PUT",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert("Failed to update token status");
        return;
      }

      console.log("Processing response:", result);

      alert(
        "Token moved to Processing successfully!"
      );

      loadQueue();
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      alert(
        "Cannot connect to backend"
      );
    } finally {
      setUpdating(null);
    }
  };

  const completeProcurement = async (tokenId) => {
    try {
      setUpdating(tokenId);

      const response = await fetch(
        `http://127.0.0.1:8000/tokens/${tokenId}/status?status=Completed`,
        {
          method: "PUT",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(
          "Failed to complete procurement"
        );
        return;
      }

      console.log(
        "Completion response:",
        result
      );

      alert(
        "Procurement completed successfully!"
      );

      loadQueue();
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      alert(
        "Cannot connect to backend"
      );
    } finally {
      setUpdating(null);
    }
  };

  const updateProcurementStage = async (
    tokenId,
    stage,
    status
  ) => {
    try {
      setUpdating(`${tokenId}-${stage}`);

      const response = await fetch(
        `http://127.0.0.1:8000/procurement-records/${tokenId}/stage?stage=${encodeURIComponent(
          stage
        )}&status=${encodeURIComponent(status)}`,
        {
          method: "PUT",
        }
      );

      const result = await response.json();

      console.log(
        "Procurement stage response:",
        result
      );

      if (!response.ok) {
        alert(
          result.message ||
            "Failed to update procurement stage."
        );
        return;
      }

      alert(
        `${stage} updated to ${status}.`
      );

      loadQueue();
    } catch (error) {
      console.error(
        "Procurement stage error:",
        error
      );

      alert(
        "Cannot connect to backend."
      );
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="officer-page">
        <div className="empty-queue">
          <h2>
            Loading Officer Dashboard...
          </h2>
        </div>
      </div>
    );
  }

  const waitingCount =
    stats?.waiting ?? 0;

  const processingCount =
    stats?.processing ?? 0;

  const completedCount =
    stats?.completed ?? 0;

  const totalTokens =
    stats?.total_tokens ?? 0;

  const dailyCapacity =
    stats?.daily_capacity ?? 0;

  const centreStatus =
    stats?.centre_status ?? "Unknown";

  const activeCounters =
    stats?.active_counters ?? 0;

  const capacityUsed =
    stats?.capacity_percentage ?? 0;

  const remainingCapacity =
    stats?.remaining_capacity ?? 0;

  const procurementProgress =
    stats?.procurement_progress ?? 0;

  return (
    <div className="officer-page">

      {/* Header */}

      <header className="officer-header">

        <div className="officer-brand">
          <h1>
            🌾 Smart Procurement
          </h1>

          <p>
            Procurement Centre Management
          </p>
        </div>

        <div className="officer-info">

          <div className="officer-avatar">
            O
          </div>

          <div>
            <strong>
              Centre Officer
            </strong>

            <p>
              Thoothukudi Centre
            </p>
          </div>

        </div>

      </header>

      {/* Main */}

      <main className="officer-main">

        <button
          className="back-button"
          onClick={() =>
            window.history.back()
          }
        >
          ← Back to Farmer Dashboard
        </button>

        <section className="officer-title">

          <h2>
            Officer Dashboard
          </h2>

          <p>
            Monitor farmers, manage the live
            queue and process procurement.
          </p>

        </section>

        {/* Statistics */}

        <section className="officer-stats">

          <div className="stat-card">
            <span>
              👥 Total Queue
            </span>
            <h3>
              {totalTokens}
            </h3>
          </div>

          <div className="stat-card">
            <span>
              ⏳ Waiting
            </span>
            <h3>
              {waitingCount}
            </h3>
          </div>

          <div className="stat-card">
            <span>
              🔄 Processing
            </span>
            <h3>
              {processingCount}
            </h3>
          </div>

          <div className="stat-card">
            <span>
              ✅ Completed Today
            </span>
            <h3>
              {completedCount}
            </h3>
          </div>

          <div className="stat-card">
            <span>
              🏢 Centre Capacity
            </span>

            <h3>
              {capacityUsed}%
            </h3>

            <p>
              {remainingCapacity} slots remaining
            </p>
          </div>

        </section>

        {/* Procurement Progress */}

        <section className="progress-panel">

          <div className="progress-header">

            <div>

              <h2>
                📦 Today's Procurement Progress
              </h2>

              <p>
                Track the number of farmers
                whose procurement has been
                completed.
              </p>

            </div>

            <strong>
              {procurementProgress}%
            </strong>

          </div>

          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{
                width: `${procurementProgress}%`,
              }}
            ></div>

          </div>

          <div className="progress-details">

            <span>
              <strong>
                {completedCount}
              </strong>{" "}
              completed
            </span>

            <span>
              <strong>
                {totalTokens}
              </strong>{" "}
              total tokens
            </span>

          </div>

        </section>

        {/* Centre Operations */}

        <section className="operations-panel">

          <div className="operation-card">
            <span>
              🏢 Centre Status
            </span>

            <strong className="status-open">
  OPEN
</strong>
          </div>

          <div className="operation-card">
            <span>
              ⚙️ Active Counters
            </span>

            <strong>
              {activeCounters}
            </strong>
          </div>

          <div className="operation-card">
            <span>
              📦 Daily Capacity
            </span>

            <strong>
              {dailyCapacity}
            </strong>
          </div>

          <div className="operation-card">
            <span>
              📊 Remaining Capacity
            </span>

            <strong>
              {remainingCapacity}
            </strong>
          </div>

        </section>

        {/* Queue */}

        <section className="queue-panel">

          <div className="queue-header">

            <h2>
              🎫 Live Farmer Queue
            </h2>

            <span className="live-indicator">
              🟢 Live • Updates every 5 sec
            </span>

          </div>

          {queue.length === 0 ? (

            <div className="empty-queue">

              <h3>
                No farmers currently in the queue
              </h3>

              <p>
                New farmer tokens will
                automatically appear here.
              </p>

            </div>

          ) : (

            <table className="queue-table">

              <thead>

                <tr>
                  <th>Position</th>
                  <th>Token</th>
                  <th>Farmer ID</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {queue.map((farmer) => {

                  const status =
                    String(
                      farmer.status
                    ).toLowerCase();

                  const isUpdating =
                    updating ===
                    farmer.token_id;

                  return (

                    <tr
                      key={
                        farmer.token_id
                      }
                    >

                      <td>
                        {status ===
                        "waiting"
                          ? farmer.queue_position
                          : "—"}
                      </td>

                      <td className="token-number">
                        {farmer.token_number}
                      </td>

                      <td>
                        Farmer #
                        {farmer.farmer_id}
                      </td>

                      <td>

                        <span
                          className={`status ${
                            status ===
                            "processing"
                              ? "status-processing"
                              : status ===
                                "waiting"
                              ? "status-waiting"
                              : "status-completed"
                          }`}
                        >
                          {farmer.status}
                        </span>

                      </td>

                      <td>

                        {status ===
                          "waiting" && (

                          <button
                            className="action-button"
                            disabled={
                              isUpdating
                            }
                            onClick={() =>
                              startProcessing(
                                farmer.token_id
                              )
                            }
                          >
                            {isUpdating
                              ? "Updating..."
                              : "▶ Start Processing"}
                          </button>

                        )}

                        {status ===
                          "processing" && (

                          <div className="procurement-actions">

                            <button
                              className="action-button"
                              disabled={
                                updating !==
                                  null
                              }
                              onClick={() =>
                                updateProcurementStage(
                                  farmer.token_id,
                                  "verification",
                                  "Completed"
                                )
                              }
                            >
                              ✓ Verification
                            </button>

                            <button
                              className="action-button"
                              disabled={
                                updating !==
                                  null
                              }
                              onClick={() =>
                                updateProcurementStage(
                                  farmer.token_id,
                                  "quality",
                                  "Completed"
                                )
                              }
                            >
                              ✓ Quality Check
                            </button>

                            <button
                              className="action-button"
                              disabled={
                                updating !==
                                  null
                              }
                              onClick={() =>
                                updateProcurementStage(
                                  farmer.token_id,
                                  "weighing",
                                  "Completed"
                                )
                              }
                            >
                              ✓ Weighing
                            </button>

                            <button
                              className="action-button"
                              disabled={
                                updating !==
                                  null
                              }
                              onClick={() =>
                                updateProcurementStage(
                                  farmer.token_id,
                                  "procurement",
                                  "Completed"
                                )
                              }
                            >
                              ✓ Procurement
                            </button>

                            <button
                              className="action-button"
                              disabled={
                                updating !==
                                  null
                              }
                              onClick={() =>
                                updateProcurementStage(
                                  farmer.token_id,
                                  "payment",
                                  "Paid"
                                )
                              }
                            >
                              ₹ Mark Paid
                            </button>

                            <button
                              className="action-button"
                              disabled={
                                updating !==
                                  null
                              }
                              onClick={() =>
                                completeProcurement(
                                  farmer.token_id
                                )
                              }
                            >
                              ✓ Complete Token
                            </button>

                          </div>

                        )}

                        {status ===
                          "completed" && (

                          <span className="completed-text">
                            ✓ Completed
                          </span>

                        )}

                      </td>

                    </tr>

                  );
                })}

              </tbody>

            </table>

          )}

        </section>

      </main>

    </div>
  );
}

export default OfficerDashboard;