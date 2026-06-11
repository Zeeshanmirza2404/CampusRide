import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    ride: { type: mongoose.Schema.Types.ObjectId, ref: "Ride" },
    passenger: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    passengerName: String,
    passengerPhone: String,
    status: { type: String, default: "confirmed" }
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
