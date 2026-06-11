import express, { Router } from "express";
import { createBooking, getBookings, getBookingById } from "../controllers/bookingController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router: Router = express.Router();

router.post("/", authMiddleware as any, createBooking);
router.get("/", authMiddleware as any, getBookings);
router.get("/:id", authMiddleware as any, getBookingById);

export default router;
