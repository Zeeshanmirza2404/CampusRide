import Booking from "../models/Booking.js";
import Ride from "../models/Ride.js";
import User from "../models/User.js";

export const createBooking = async (req, res) => {
  try {
    const { rideId, passengerName, passengerPhone } = req.body;
    const passengerId = req.user.id;

    // Check if ride exists
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Check if user has already booked this ride
    const existingBooking = await Booking.findOne({
      ride: rideId,
      passenger: passengerId
    });
    if (existingBooking) {
      return res.status(400).json({ message: "You have already booked this ride" });
    }

    // Check if seats are available
    if (ride.seatsAvailable <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }

    // Create booking
    const booking = await Booking.create({
      ride: rideId,
      passenger: passengerId,
      passengerName: passengerName || "Unknown",
      passengerPhone: passengerPhone || "",
      status: "confirmed"
    });

    // Update ride seats and bookedBy
    const updatedSeats = ride.seatsAvailable - 1;
    const updateData = { 
      seatsAvailable: updatedSeats, 
      $push: { bookedBy: passengerId },
      status: "accepted" // Transition to accepted for tracking workflow
    };
    await Ride.findByIdAndUpdate(rideId, updateData, { new: true });

    // Add booking to user's bookedRides
    await User.findByIdAndUpdate(passengerId, { $push: { bookedRides: booking._id } });

    // Emit Real-time Update
    if (req.io) {
      req.io.emit("ride_updated", {
        rideId,
        seatsAvailable: updatedSeats,
      });
    }

    // Populate booking details
    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: "ride",
        populate: { path: "driver" }
      })
      .populate("passenger");

    res.status(201).json({
      id: populatedBooking._id,
      rideId: populatedBooking.ride._id,
      passengerId: populatedBooking.passenger._id,
      passengerName: populatedBooking.passengerName,
      passengerPhone: populatedBooking.passengerPhone,
      driverName: populatedBooking.ride.driver?.name || "Unknown",
      driverPhone: populatedBooking.ride.driver?.phone || "",
      pickup: populatedBooking.ride.pickup,
      drop: populatedBooking.ride.drop,
      price: populatedBooking.ride.pricePerSeat,
      date: populatedBooking.ride.date,
      details: populatedBooking.ride.details,
      status: populatedBooking.status
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Failed to create booking" });
  }
};

export const getBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("[DEBUG] Fetching bookings for user:", userId);

    const user = await User.findById(userId).populate({
      path: 'bookedRides',
      populate: [
        { path: 'ride', populate: { path: 'driver' } },
        { path: 'passenger' }
      ]
    });

    if (!user) {
      console.log("[DEBUG] User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("[DEBUG] Found bookings count:", user.bookedRides.length);

    res.json(
      user.bookedRides
      .filter((booking) => booking.ride != null)
      .map((booking) => ({
        id: booking._id,
        rideId: booking.ride._id,
        passengerId: booking.passenger._id,
        passengerName: booking.passengerName,
        passengerPhone: booking.passengerPhone,
        status: booking.status,
        ride: {
          id: booking.ride._id,
          driverId: booking.ride.driver?._id,
          driverName: booking.ride.driver?.name,
          driverPhone: booking.ride.driver?.phone,
          pickup: booking.ride.pickup,
          drop: booking.ride.drop,
          date: booking.ride.date,
          time: booking.ride.time,
          seatsAvailable: booking.ride.seatsAvailable,
          pricePerSeat: booking.ride.pricePerSeat,
          status: booking.ride.status,
          details: booking.ride.details, // Add details field
        }
      }))
    );
  } catch (error) {
    console.error("[ERROR] Error fetching bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findById(id)
      .populate("ride")
      .populate("passenger");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is the passenger
    if (booking.passenger._id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json({
      id: booking._id,
      rideId: booking.ride._id,
      passengerId: booking.passenger._id,
      passengerName: booking.passengerName,
      passengerPhone: booking.passengerPhone,
      status: booking.status
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Failed to fetch booking" });
  }
};
