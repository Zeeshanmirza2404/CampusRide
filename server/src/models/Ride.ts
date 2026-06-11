import mongoose, { Schema, Document } from "mongoose";

export interface IRide extends Document {
  driver: mongoose.Types.ObjectId;
  pickup: string;
  pickupCoords: {
    lat: number;
    lng: number;
  };
  drop: string;
  dropCoords: {
    lat: number;
    lng: number;
  };
  date: Date;
  time: string;
  seatsAvailable: number;
  pricePerSeat: number;
  status: "searching" | "active" | "booked" | "accepted" | "ongoing" | "completed" | "inactive";
  lastKnownLocation?: {
    lat: number;
    lng: number;
  };
  trackingActive: boolean;
  bookedBy: mongoose.Types.ObjectId[];
  details?: string;
  createdAt: Date;
  updatedAt: Date;
}

const rideSchema = new Schema<IRide>(
  {
    driver: { type: Schema.Types.ObjectId, ref: "User" },
    pickup: String,
    pickupCoords: {
      lat: Number,
      lng: Number
    },
    drop: String,
    dropCoords: {
      lat: Number,
      lng: Number
    },
    date: { type: Date, index: { expires: '30d' } },
    time: String,
    seatsAvailable: Number,
    pricePerSeat: Number,
    status: { type: String, enum: ["searching", "active", "booked", "accepted", "ongoing", "completed", "inactive"], default: "active" },
    lastKnownLocation: {
      lat: Number,
      lng: Number
    },
    trackingActive: { type: Boolean, default: false },
    bookedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    details: String
  },
  { timestamps: true }
);

export default mongoose.model<IRide>("Ride", rideSchema);
