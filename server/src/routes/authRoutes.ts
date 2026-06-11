import express, { Router } from "express";
import { signup, login, getProfile } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router: Router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", authMiddleware as any, getProfile);

export default router;
