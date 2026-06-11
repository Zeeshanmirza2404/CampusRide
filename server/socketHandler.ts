import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Ride from "./src/models/Ride.js";

const JWT_SECRET = process.env.JWT_SECRET || "campusride_secret";

export const initializeSocket = (io: Server): void => {
  // 1. JWT Authentication Middleware for Socket
  io.use((socket: any, next) => { // TODO: type this properly
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.token;
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) return next(new Error("Authentication error: Invalid token"));
        socket.user = decoded; // Store user details in socket
        next();
      });
    } catch (e) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: any) => { // TODO: type this properly
    console.log(`[Socket] User connected: ${socket.user.id} (Socket ID: ${socket.id})`);

    // Join Ride Room (validate user is part of the ride)
    socket.on("joinRideRoom", async ({ rideId }: { rideId: string }) => {
        if (!rideId) return;
        try {
            const ride = await Ride.findById(rideId);
            if (!ride) {
                return socket.emit("roomError", { message: "Ride not found" });
            }

            const isDriver = ride.driver.toString() === socket.user.id;
            const isRider = ride.bookedBy.some(id => id.toString() === socket.user.id);

            if (!isDriver && !isRider) {
                return socket.emit("roomError", { message: "Unauthorized to join this ride room" });
            }

            socket.join(rideId);
            console.log(`[Socket Success] User ${socket.user.id} joined room ${rideId}`);
            socket.emit("joinedRoom", { 
                rideId, 
                status: ride.status, 
                location: ride.lastKnownLocation || null,
                pickupCoords: ride.pickupCoords,
                dropCoords: ride.dropCoords
            });
        } catch (err) {
            console.error("[Socket] joinRideRoom error:", err);
            socket.emit("roomError", { message: "Failed to join room" });
        }
    });

    // Handle Ride Status Transitions (Searching -> Accepted -> Ongoing -> Completed)
    socket.on("updateRideStatus", async ({ rideId, status }: { rideId: string, status: string }) => {
        try {
            const ride = await Ride.findById(rideId);
            if (!ride) return;

            // Only allow driver to change status
            if (ride.driver.toString() !== socket.user.id) {
                return socket.emit("roomError", { message: "Only drivers can update ride status" });
            }

            ride.status = status as any;
            if (status === "ongoing") {
                ride.trackingActive = true;
            } else if (status === "completed") {
                ride.trackingActive = false;
            }
            await ride.save();

            console.log(`[Socket Action] Ride ${rideId} status changed to ${status}`);
            
            // Broadcast the new status to everyone in the room (Driver & Riders)
            io.to(rideId).emit("rideStatusChanged", { rideId, status });
        } catch (err) {
            console.error("[Socket] updateRideStatus error:", err);
        }
    });

    // Start Tracking (Manual trigger for Driver)
    socket.on("startTracking", async ({ rideId }: { rideId: string }) => {
        try {
            const ride = await Ride.findById(rideId);
            if (ride && ride.driver.toString() === socket.user.id) {
                ride.trackingActive = true;
                await ride.save();
                console.log(`[Socket Info] Tracking started for ride ${rideId}`);
                io.to(rideId).emit("trackingStarted", { rideId });
            }
        } catch (err) {
            console.error("[Socket] startTracking error:", err);
        }
    });

    // Handle Location Update
    socket.on("driverLocationUpdate", async ({ rideId, location }: { rideId: string, location: any }) => {
        // Unidirectional: Driver broadcasts to room
        socket.to(rideId).emit("locationUpdated", { location });

        // Throttle DB updates (Save to DB max once every 15 seconds)
        const now = Date.now();
        if (!socket.lastDbSave || now - socket.lastDbSave > 15000) {
            try {
                const ride = await Ride.findById(rideId);
                // Production logic: Only update DB if ride is active or ongoing
                if (ride && (ride.status === "ongoing" || ride.status === "accepted")) {
                    ride.lastKnownLocation = location;
                    await ride.save();
                    socket.lastDbSave = now;
                    console.log(`[Socket Info] Throttled DB update for ride ${rideId}`);
                }
            } catch (err) {
                console.error("[Socket] driverLocationUpdate DB error:", err);
            }
        }
    });

    // Stop Tracking
    socket.on("stopTracking", async ({ rideId }: { rideId: string }) => {
        try {
            const ride = await Ride.findById(rideId);
            if (ride && ride.driver.toString() === socket.user.id) {
                ride.trackingActive = false;
                await ride.save();
                socket.to(rideId).emit("trackingStopped", { rideId });
            }
        } catch (err) {
            console.error("[Socket] stopTracking error:", err);
        }
    });
    
    // Leave Room
    socket.on("leaveRideRoom", ({ rideId }: { rideId: string }) => {
        if (rideId) {
            socket.leave(rideId);
            console.log(`[Socket Success] User ${socket.user.id} left room ${rideId}`);
        }
    });

    socket.on("disconnect", () => {
        console.log(`[Socket] User disconnected: ${socket?.user?.id}`);
    });
  });
};
