import express from "express";
import {
  createRide,
  getRides,
  getUserRides,
  updateRide,
  deleteRide
} from "../controllers/rideController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createRide);
router.get("/user", authMiddleware, getUserRides);
router.get("/", getRides);
router.put("/:id", authMiddleware, updateRide);
router.delete("/:id", authMiddleware, deleteRide);

export default router;
