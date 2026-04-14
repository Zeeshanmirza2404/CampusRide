import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTracking, useDriverTracking, useRiderTracking } from "../context/TrackingContext";
import LeafletMap from "../maps/LeafletMap";

const DashboardMapPanel = () => {
  const { 
    trackedRideId, userRole, rideStatus, 
    driverLocation, riderLocation, 
    pickupCoords, dropCoords,
    isTracking, socketStatus, 
    stopTrackingSession, updateRideStatus 
  } = useTracking();

  // Mount tracking hooks
  useDriverTracking();
  useRiderTracking();

  const getStatusText = () => {
    switch (rideStatus) {
      case "searching": return "Finding a driver...";
      case "accepted": return "Heading to Pickup";
      case "ongoing": return "Trip In Progress";
      case "completed": return "Destination Reached";
      default: return userRole === "driver" ? "Broadcasting live..." : "Tracking driver...";
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!trackedRideId ? (
        <motion.div
           key="standby"
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 1.02 }}
           className="h-100 card-custom d-flex flex-column justify-content-center align-items-center p-4 shadow-sm border-0 bg-white"
           style={{ minHeight: "350px", overflow: "hidden" }}
        >
          {/* Professional Radar Pulse */}
          <div className="position-relative mb-4" style={{ width: "120px", height: "120px" }}>
            <div className="position-absolute top-50 start-50 translate-middle rounded-circle bg-primary opacity-10" 
                 style={{ width: "100%", height: "100%", animation: "radar-pulse 3s infinite ease-out" }}></div>
            <div className="position-absolute top-50 start-50 translate-middle rounded-circle bg-primary opacity-20" 
                 style={{ width: "70%", height: "70%", animation: "radar-pulse 3s infinite ease-out 1s" }}></div>
            <div className="position-absolute top-50 start-50 translate-middle rounded-circle bg-primary shadow d-flex align-items-center justify-content-center" 
                 style={{ width: "50px", height: "50px", zIndex: 2 }}>
              <i className="bi bi-broadcast text-white h4 mb-0"></i>
            </div>
          </div>

          <h5 className="fw-bold mb-1 text-dark">Live Tracking Interface</h5>
          <p className="text-center text-muted small px-5">Your ride details and live tracking will appear here once active.</p>
        </motion.div>
      ) : (
        <motion.div
          key="active-tracking"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="h-100 card-custom position-relative overflow-hidden shadow-lg border-0"
          style={{ minHeight: "500px" }}
        >
          {/* Floating HUD: Status Pill */}
          <div className="position-absolute top-0 start-50 translate-middle-x p-3" style={{ zIndex: 1000 }}>
            <div className="bg-white px-4 py-2 rounded-pill shadow-lg d-flex align-items-center border">
              <div className={`status-indicator shadow-sm me-2 ${socketStatus.includes("Active") ? "bg-success" : "bg-warning"}`}></div>
              <span className="text-dark fw-bold small text-nowrap" style={{ letterSpacing: '0.5px' }}>
                {getStatusText().toUpperCase()}
              </span>
            </div>
          </div>

          {/* Floating HUD: Close Button */}
          <div className="position-absolute top-0 end-0 p-3" style={{ zIndex: 1000 }}>
            <button 
              className="btn btn-dark rounded-circle d-flex align-items-center justify-content-center shadow-lg border-0" 
              style={{ width: '40px', height: '40px' }}
              onClick={stopTrackingSession}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div style={{ height: "100%", width: "100%" }}>
            <LeafletMap 
              driverLocation={driverLocation} 
              riderLocation={riderLocation}
              pickupCoords={pickupCoords}
              dropCoords={dropCoords}
              rideStatus={rideStatus}
            />
          </div>

          {/* Floating HUD: Driver Action Card */}
          {userRole === "driver" && (
            <div className="position-absolute bottom-0 start-50 translate-middle-x w-100 px-3 pb-4" style={{ zIndex: 1001, maxWidth: '400px' }}>
              <div className="bg-white p-3 rounded-4 shadow-2xl border text-center">
                <div className="mb-2">
                   <p className="text-muted small mb-1">Current Status: <span className="text-dark fw-bold">{getStatusText()}</span></p>
                </div>
                {rideStatus === "accepted" && (
                  <button 
                    className="btn btn-primary w-100 fw-bold py-3 rounded-3 shadow-sm pulse-glow-btn"
                    onClick={() => updateRideStatus("ongoing")}
                  >
                    🚀 MARK AS PICKED UP
                  </button>
                )}
                {rideStatus === "ongoing" && (
                  <button 
                    className="btn btn-success w-100 fw-bold py-3 rounded-3 shadow-sm border-0"
                    style={{ background: 'linear-gradient(135deg, #198754, #146c43)' }}
                    onClick={() => updateRideStatus("completed")}
                  >
                    🏁 END TRIP & COMPLETE
                  </button>
                )}
                {rideStatus === "completed" && (
                  <div className="text-success fw-bold py-2">
                    <i className="bi bi-check-circle-fill me-2"></i> Ride Finished
                  </div>
                )}
              </div>
            </div>
          )}

          <style>
            {`
              @keyframes radar-pulse {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
              }
              .status-indicator {
                width: 10px; height: 10px; border-radius: 50%;
                animation: soft-pulse 1.5s infinite;
              }
              @keyframes soft-pulse {
                0% { opacity: 0.5; }
                50% { opacity: 1; }
                100% { opacity: 0.5; }
              }
              .pulse-glow-btn {
                animation: pulse-glow 2s infinite;
                transition: transform 0.2s ease;
              }
              .pulse-glow-btn:hover { transform: scale(1.02); }
              @keyframes pulse-glow {
                0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); }
                100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
              }
              .shadow-2xl {
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
              }
            `}
          </style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DashboardMapPanel;
