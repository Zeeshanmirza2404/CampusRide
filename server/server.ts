import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import connectDB from "./src/config/db.js";

import authRoutes from "./src/routes/authRoutes.js";
import rideRoutes from "./src/routes/rideRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import { initializeSocket } from "./socketHandler.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"]
  }
});

connectDB();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Attach io to req
app.use((req: Request, res: Response, next: NextFunction) => {
  req.io = io;
  next();
});

// Request logging middleware for debugging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

// Initialize socket events with authentication
initializeSocket(io);

server.listen(5000, () => console.log("Server running on port 5000"));
