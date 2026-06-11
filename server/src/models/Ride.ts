import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
    bookedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    details: String
  },
  { timestamps: true }
);

export default mongoose.model("Ride", rideSchema);
