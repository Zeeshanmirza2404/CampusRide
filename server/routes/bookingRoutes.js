import express from "express";
import { createBooking, getBookings, getBookingById } from "../controllers/bookingController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createBooking);
router.get("/", authMiddleware, getBookings);
router.get("/:id", authMiddleware, getBookingById);

export default router;
