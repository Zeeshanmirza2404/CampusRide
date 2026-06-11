import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  phone: string;
  password?: string;
  college?: string;
  role: "rider" | "driver" | "both";
  bookedRides: mongoose.Types.ObjectId[];
  myRides: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: String,
    email: { type: String, unique: true },
    phone: { type: String, unique: true },
    password: String,
    college: String,
    role: {
      type: String,
      enum: ["rider", "driver", "both"],
      required: true
    },
    bookedRides: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
    myRides: [{ type: Schema.Types.ObjectId, ref: "Ride" }]
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
