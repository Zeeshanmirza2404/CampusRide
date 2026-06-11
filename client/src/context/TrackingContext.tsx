import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

const TrackingContext = createContext();

export const useTracking = () => useContext(TrackingContext);

export const TrackingProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [socketStatus, setSocketStatus] = useState("Disconnected");
  const [trackedRideId, setTrackedRideId] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'driver' or 'rider'
  const [rideStatus, setRideStatus] = useState(null);
  
  const [driverLocation, setDriverLocation] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null); // Local only for rider
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  
  const [isTracking, setIsTracking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const socketRef = useRef(null);

  // Initialize Socket connection
  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) return;
    
    setSocketStatus("Connecting...");
    // Production Token Key
    const token = localStorage.getItem("campusride_token");
    
    if (!token) {
      setSocketStatus("Auth Error");
      return;
    }

    const newSocket = io("http://localhost:5000", { 
      auth: { token }, 
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });
    
    newSocket.on("connect", () => {
      console.log("[Socket] Connected to server");
      setSocketStatus("Live Tracking Active");
      setSocket(newSocket);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
      setSocketStatus("Disconnected");
      setSocket(null);
    });

    newSocket.on("roomError", (err) => {
      setErrorMsg(err.message);
      setSocketStatus("Error");
    });

    newSocket.on("joinedRoom", (data) => {
      console.log("[Socket] Joined Room:", data);
      setRideStatus(data.status);
      if (data.location) setDriverLocation(data.location);
      if (data.pickupCoords) setPickupCoords(data.pickupCoords);
      if (data.dropCoords) setDropCoords(data.dropCoords);
    });

    newSocket.on("rideStatusChanged", (data) => {
      console.log("[Socket] Ride Status Changed:", data.status);
      setRideStatus(data.status);
    });

    newSocket.on("locationUpdated", (data) => {
      if (data.location) setDriverLocation(data.location);
    });

    socketRef.current = newSocket;
  }, []);

  const resetTrackingState = () => {
    setTrackedRideId(null);
    setUserRole(null);
    setRideStatus(null);
    setDriverLocation(null);
    setRiderLocation(null);
    setPickupCoords(null);
    setDropCoords(null);
    setIsTracking(false);
    setErrorMsg("");
  };

  const startTrackingSession = (rideId, role) => {
    if (!socketRef.current || !socketRef.current.connected) connectSocket();
    
    resetTrackingState();
    setTrackedRideId(rideId);
    setUserRole(role);
    setIsTracking(true);
    
    // We emit even if not connected yet; Socket.io buffers until connect
    if (socketRef.current) {
        socketRef.current.emit("joinRideRoom", { rideId });
        socketRef.current.emit("startTracking", { rideId });
    }
  };

  const stopTrackingSession = () => {
    if (socketRef.current && trackedRideId) {
        socketRef.current.emit("stopTracking", { rideId: trackedRideId });
        socketRef.current.emit("leaveRideRoom", { rideId: trackedRideId });
    }
    resetTrackingState();
  };

  const updateRideStatus = (status) => {
    if (socketRef.current && trackedRideId) {
      socketRef.current.emit("updateRideStatus", { rideId: trackedRideId, status });
    }
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const value = {
    socket: socketRef.current,
    socketStatus,
    trackedRideId,
    userRole,
    rideStatus,
    driverLocation,
    riderLocation,
    pickupCoords,
    dropCoords,
    isTracking,
    errorMsg,
    setErrorMsg,
    startTrackingSession,
    stopTrackingSession,
    updateRideStatus,
    setDriverLocation,
    setRiderLocation
  };

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>;
};

// --- Custom Hooks for Specific Roles ---

export const useDriverTracking = () => {
  const { trackedRideId, userRole, isTracking, socket, setErrorMsg, setDriverLocation } = useTracking();
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (userRole === "driver" && isTracking && trackedRideId) {
      if (!navigator.geolocation) {
        setErrorMsg("Geolocation not supported");
        return;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setDriverLocation(loc); // Local UI update
          if (socket && socket.connected) {
            socket.emit("driverLocationUpdate", { rideId: trackedRideId, location: loc });
          }
        },
        (err) => setErrorMsg("Please enable location permissions."),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [userRole, isTracking, trackedRideId, socket, setErrorMsg, setDriverLocation]);
};

export const useRiderTracking = () => {
  const { userRole, isTracking, setRiderLocation, setErrorMsg } = useTracking();
  const watchIdRef = useRef(null);

  useEffect(() => {
    // Rider ONLY tracks locally to show themselves on map. NO SOCKET EMIT.
    if (userRole === "rider" && isTracking) {
      if (!navigator.geolocation) return;

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setRiderLocation(loc);
        },
        (err) => console.log("Rider location access deferred."),
        { enableHighAccuracy: false, timeout: 10000 }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [userRole, isTracking, setRiderLocation]);
};
