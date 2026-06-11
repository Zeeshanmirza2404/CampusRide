import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
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
    bookedRides: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
    myRides: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ride" }]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
