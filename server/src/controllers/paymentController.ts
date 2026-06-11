import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Lazy initialization to avoid hoisting issues
let instance: any;
const getRazorpayInstance = (): any => {
  if (!instance) {
    if (!process.env.RAZORPAY_KEY_ID) {
      throw new Error("RAZORPAY_KEY_ID is missing in env");
    }
    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });
  }
  return instance;
};

export const createOrder = async (req: Request, res: Response): Promise<any> => {
  try {
    const { amount } = req.body;
    
    // Amount must be in paise (smallest currency unit)
    // Receiving amount in Rupees, so multiply by 100
    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await getRazorpayInstance().orders.create(options);

    res.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "Failed to create payment order" });
  }
};

export const verifyPayment = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
