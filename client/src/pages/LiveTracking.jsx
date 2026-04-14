import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracking, useDriverTracking, useRiderTracking } from '../context/TrackingContext';
import LeafletMap from '../maps/LeafletMap';

const LiveTracking = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { 
    trackedRideId, userRole, rideStatus, 
    driverLocation, riderLocation, 
    pickupCoords, dropCoords,
    socketStatus, errorMsg, 
    startTrackingSession, stopTrackingSession, updateRideStatus 
  } = useTracking();

  // Activate tracking handlers
  useDriverTracking();
  useRiderTracking();

  // Initialize tracking session if it's not already running for this ID
  useEffect(() => {
    if (!trackedRideId || trackedRideId !== rideId) {
      // For this page, we assume local navigation. Role should be determined by context/state.
      // We'll try to find a way to verify role soon, for now, we'll keep previous session or default to 'rider'
      startTrackingSession(rideId, userRole || 'rider');
    }
  }, [rideId, trackedRideId, userRole, startTrackingSession]);

  const getStatusLabel = () => {
    switch (rideStatus) {
      case "searching": return "Finding Driver";
      case "accepted": return "Driver Heading to Pickup";
      case "ongoing": return "Ride in Progress";
      case "completed": return "Destination Reached";
      default: return socketStatus === "Live Tracking Active" ? "LIVE" : "Connecting...";
    }
  };

  const getStatusColor = () => {
    switch (rideStatus) {
      case "accepted": return "var(--warning)";
      case "ongoing": return "var(--primary)";
      case "completed": return "var(--success)";
      default: return "var(--success)";
    }
  };

  return (
    <div className="container-fluid p-0 bg-dark" style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <AnimatePresence>
        {errorMsg && (
          <motion.div 
            initial={{ y: -50 }} animate={{ y: 20 }} exit={{ y: -50 }}
            className="position-fixed top-0 start-50 translate-middle-x z-index-master px-4 py-2 rounded-pill bg-danger text-white shadow-lg"
            style={{ zIndex: 9999 }}
          >
            <i className="bi bi-exclamation-triangle-fill me-2"></i>{errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="row g-0 h-100">
        <div className="col-12 col-lg-8 position-relative" style={{ height: 'calc(100vh - 80px)', lg: { height: '100vh' } }}>
           <LeafletMap 
              driverLocation={driverLocation} 
              riderLocation={riderLocation}
              pickupCoords={pickupCoords}
              dropCoords={dropCoords}
              rideStatus={rideStatus}
           />
           
           {/* Floating Floating HUD */}
           <div className="position-absolute top-0 start-0 w-100 p-4 d-flex justify-content-between align-items-center" style={{ zIndex: 1000 }}>
             <button className="btn btn-glass-dark border-0 rounded-circle shadow" onClick={() => navigate(-1)}>
               <i className="bi bi-arrow-left h5 mb-0 text-white"></i>
             </button>
             
             <div className="bg-glass-dark p-2 px-4 rounded-pill shadow d-flex align-items-center gap-3">
                <div className="status-dot-container">
                   <div className="status-dot" style={{ backgroundColor: getStatusColor() }}></div>
                   <div className="status-dot-pulse" style={{ backgroundColor: getStatusColor() }}></div>
                </div>
                <span className="text-white fw-bold small tracking-widest">{getStatusLabel().toUpperCase()}</span>
             </div>
           </div>
        </div>

        <div className="col-12 col-lg-4 bg-dark border-start border-secondary p-4 d-flex flex-column">
           <div className="mb-auto">
             <h4 className="text-white fw-bold mb-4">Trip Details</h4>
             
             <div className="card bg-secondary bg-opacity-10 border-0 rounded-4 p-3 mb-3">
               <div className="d-flex align-items-center gap-3 mb-3">
                 <div className="bg-primary bg-opacity-20 p-3 rounded-3 text-primary">
                    <i className="bi bi-geo-alt h4 mb-0"></i>
                 </div>
                 <div>
                    <span className="text-muted small d-block">Current Phase</span>
                    <span className="text-white fw-bold">
                       {rideStatus === 'accepted' ? 'Heading to Pickup' : 'Heading to Drop-off'}
                    </span>
                 </div>
               </div>
             </div>
           </div>

           <div className="mt-4">
             {userRole === 'driver' ? (
               <div className="d-grid gap-3">
                 {rideStatus === 'accepted' && (
                   <button 
                     className="btn btn-primary btn-lg rounded-4 py-3 fw-bold pulse-glow"
                     onClick={() => updateRideStatus('ongoing')}
                   >
                     START RIDE
                   </button>
                 )}
                 {rideStatus === 'ongoing' && (
                   <button 
                     className="btn btn-success btn-lg rounded-4 py-3 fw-bold"
                     onClick={() => updateRideStatus('completed')}
                   >
                     MARK AS COMPLETED
                   </button>
                 )}
                 <button className="btn btn-outline-danger border-0 py-3" onClick={stopTrackingSession}>
                    Cancel Broadcast
                 </button>
               </div>
             ) : (
               <div className="bg-secondary bg-opacity-20 rounded-4 p-4 text-center">
                  <p className="text-muted mb-0 small">Rider View Mode</p>
                  <p className="text-white fw-medium">Tracking Driver in Real-Time</p>
               </div>
             )}
           </div>
        </div>
      </div>

      <style>
        {`
          .bg-glass-dark {
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .btn-glass-dark {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(8px);
            width: 50px;
            height: 50px;
          }
          .status-dot-container { position: relative; width: 12px; height: 12px; }
          .status-dot { width: 100%; height: 100%; border-radius: 50%; z-index: 2; position: relative; }
          .status-dot-pulse {
            width: 100%; height: 100%; border-radius: 50%; position: absolute; top: 0; left: 0;
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            z-index: 1;
          }
          @keyframes ping {
            75%, 100% { transform: scale(3); opacity: 0; }
          }
          .pulse-glow {
            box-shadow: 0 0 15px rgba(13, 110, 253, 0.5);
            animation: glow 2s infinite;
          }
          @keyframes glow {
            0% { box-shadow: 0 0 5px rgba(13, 110, 253, 0.2); }
            50% { box-shadow: 0 0 20px rgba(13, 110, 253, 0.5); }
            100% { box-shadow: 0 0 5px rgba(13, 110, 253, 0.2); }
          }
        `}
      </style>
    </div>
  );
};

export default LiveTracking;
