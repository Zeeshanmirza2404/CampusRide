import express, { Router } from "express";
import {
  createRide,
  getRides,
  getUserRides,
  updateRide,
  deleteRide
} from "../controllers/rideController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router: Router = express.Router();

router.post("/", authMiddleware as any, createRide);
router.get("/user", authMiddleware as any, getUserRides);
router.get("/", getRides);
router.put("/:id", authMiddleware as any, updateRide);
router.delete("/:id", authMiddleware as any, deleteRide);

export default router;
