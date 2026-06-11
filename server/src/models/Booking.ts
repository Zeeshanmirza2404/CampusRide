import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  ride: mongoose.Types.ObjectId;
  passenger: mongoose.Types.ObjectId;
  passengerName: string;
  passengerPhone: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    ride: { type: Schema.Types.ObjectId, ref: "Ride" },
    passenger: { type: Schema.Types.ObjectId, ref: "User" },
    passengerName: String,
    passengerPhone: String,
    status: { type: String, default: "confirmed" }
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>("Booking", bookingSchema);
