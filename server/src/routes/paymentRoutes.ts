import express, { Router } from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router: Router = express.Router();

router.post("/create-order", authMiddleware as any, createOrder);
router.post("/verify", authMiddleware as any, verifyPayment);

export default router;
