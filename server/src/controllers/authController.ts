import { Request, Response } from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, phone, password, college, role } = req.body;
    
    // Normalize email
    const normalizedEmail = email?.toLowerCase().trim();

    // Validation
    if (!name || !normalizedEmail || !phone || !password || !college || !role) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters long" 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email format" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      college,
      role,
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "campusride_secret",
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone,
        college: user.college
      }
    });
  } catch (err: any) {
    console.error("[Backend Signup Error]:", err.message);
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "User with this email or phone already exists" 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: "Internal server error. Please try again later." 
    });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    const match = await bcrypt.compare(password, user.password as string);
    if (!match) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "campusride_secret",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone,
        college: user.college
      }
    });
  } catch (err: any) {
    console.error("[Backend Login Error]:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error. Please try again later." 
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await User.findById(req.user!.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        college: user.college
      }
    });
  } catch (error: any) {
    console.error("[Backend Profile Error]:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to retrieve profile" 
    });
  }
};
