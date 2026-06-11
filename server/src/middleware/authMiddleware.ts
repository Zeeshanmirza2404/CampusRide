import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const authMiddleware = (req: Request, res: Response, next: NextFunction): any => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("[DEBUG] Auth token received:", token ? "YES" : "NO");
  
  if (!token) {
    console.log("[DEBUG] No token provided in request");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const secret = process.env.JWT_SECRET || "campusride_secret";
    console.log("[DEBUG] Verifying token with secret:", secret);
    const decoded = jwt.verify(token, secret) as any;
    console.log("[DEBUG] Token decoded successfully:", {
      userId: decoded.id,
      role: decoded.role,
      exp: new Date(decoded.exp * 1000).toISOString()
    });
    req.user = decoded;
    next();
  } catch (error: any) {
    console.log("[DEBUG] Token verification failed:", error.message);
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default authMiddleware;
