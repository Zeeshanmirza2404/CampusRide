import React, { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from "react";
import { io, Socket } from "socket.io-client";

interface Coords {
  lat: number;
  lng: number;
}

interface TrackingContextType {
  socket: Socket | null;
  socketStatus: string;
  trackedRideId: string | null;
  userRole: string | null;
  rideStatus: string | null;
  driverLocation: Coords | null;
  riderLocation: Coords | null;
  pickupCoords: Coords | null;
  dropCoords: Coords | null;
  isTracking: boolean;
  errorMsg: string;
  setErrorMsg: (msg: string) => void;
  startTrackingSession: (rideId: string, role: string) => void;
  stopTrackingSession: () => void;
  updateRideStatus: (status: string) => void;
  setDriverLocation: (loc: Coords | null) => void;
  setRiderLocation: (loc: Coords | null) => void;
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export const useTracking = (): TrackingContextType => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error("useTracking must be used within a TrackingProvider");
  }
  return context;
};

export const TrackingProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketStatus, setSocketStatus] = useState("Disconnected");
  const [trackedRideId, setTrackedRideId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [rideStatus, setRideStatus] = useState<string | null>(null);
  
  const [driverLocation, setDriverLocation] = useState<Coords | null>(null);
  const [riderLocation, setRiderLocation] = useState<Coords | null>(null);
  const [pickupCoords, setPickupCoords] = useState<Coords | null>(null);
  const [dropCoords, setDropCoords] = useState<Coords | null>(null);
  
  const [isTracking, setIsTracking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const socketRef = useRef<Socket | null>(null);

  // Initialize Socket connection
  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) return;
    
    setSocketStatus("Connecting...");
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

    newSocket.on("roomError", (err: { message: string }) => {
      setErrorMsg(err.message);
      setSocketStatus("Error");
    });

    newSocket.on("joinedRoom", (data: any) => {
      console.log("[Socket] Joined Room:", data);
      setRideStatus(data.status);
      if (data.location) setDriverLocation(data.location);
      if (data.pickupCoords) setPickupCoords(data.pickupCoords);
      if (data.dropCoords) setDropCoords(data.dropCoords);
    });

    newSocket.on("rideStatusChanged", (data: { status: string }) => {
      console.log("[Socket] Ride Status Changed:", data.status);
      setRideStatus(data.status);
    });

    newSocket.on("locationUpdated", (data: { location: Coords }) => {
      if (data.location) setDriverLocation(data.location);
    });

    socketRef.current = newSocket;
  }, []);

  const resetTrackingState = (): void => {
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

  const startTrackingSession = (rideId: string, role: string): void => {
    if (!socketRef.current || !socketRef.current.connected) connectSocket();
    
    resetTrackingState();
    setTrackedRideId(rideId);
    setUserRole(role);
    setIsTracking(true);
    
    if (socketRef.current) {
        socketRef.current.emit("joinRideRoom", { rideId });
        socketRef.current.emit("startTracking", { rideId });
    }
  };

  const stopTrackingSession = (): void => {
    if (socketRef.current && trackedRideId) {
        socketRef.current.emit("stopTracking", { rideId: trackedRideId });
        socketRef.current.emit("leaveRideRoom", { rideId: trackedRideId });
    }
    resetTrackingState();
  };

  const updateRideStatus = (status: string): void => {
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

  const value: TrackingContextType = {
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

export const useDriverTracking = (): void => {
  const ctx = useTracking();
  const { trackedRideId, userRole, isTracking, socket, setErrorMsg, setDriverLocation } = ctx!;
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (userRole === "driver" && isTracking && trackedRideId) {
      if (!navigator.geolocation) {
        setErrorMsg("Geolocation not supported");
        return;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const loc: { lat: number; lng: number } = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setDriverLocation(loc);
          if (socket && socket.connected) {
            socket.emit("driverLocationUpdate", { rideId: trackedRideId, location: loc });
          }
        },
        (_err) => setErrorMsg("Please enable location permissions."),
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

export const useRiderTracking = (): void => {
  const ctx = useTracking();
  const { userRole, isTracking, setRiderLocation, setErrorMsg } = ctx!;
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (userRole === "rider" && isTracking) {
      if (!navigator.geolocation) return;

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setRiderLocation(loc);
        },
        (_err) => console.log("Rider location access deferred."),
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
