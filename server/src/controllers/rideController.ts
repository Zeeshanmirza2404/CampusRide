import Ride from "../models/Ride.js";
import User from "../models/User.js";

export const createRide = async (req, res) => {
  try {
    const { pickup, drop, pickupCoords, dropCoords, date, time, seatsAvailable, pricePerSeat, details } = req.body;
    const driverId = req.user.id;

    const ride = await Ride.create({
      driver: driverId,
      pickup,
      pickupCoords,
      drop,
      dropCoords,
      date,
      time,
      seatsAvailable,
      pricePerSeat,
      details,
      status: "active"
    });

    // Add ride to user's myRides
    await User.findByIdAndUpdate(driverId, { $push: { myRides: ride._id } });

    // Populate driver details
    const populatedRide = await Ride.findById(ride._id).populate("driver");

    res.status(201).json({
      id: populatedRide._id,
      driverId: populatedRide.driver._id,
      driverName: populatedRide.driver.name,
      driverPhone: populatedRide.driver.phone,
      driverCollege: populatedRide.driver.college,
      pickup: populatedRide.pickup,
      pickupCoords: populatedRide.pickupCoords,
      drop: populatedRide.drop,
      dropCoords: populatedRide.dropCoords,
      date: populatedRide.date,
      time: populatedRide.time,
      seatsAvailable: populatedRide.seatsAvailable,
      pricePerSeat: populatedRide.pricePerSeat,
      status: populatedRide.status,
      details: populatedRide.details
    });
  } catch (error) {
    console.error("Error creating ride:", error);
    res.status(500).json({ message: "Failed to create ride" });
  }
};

export const getRides = async (req, res) => {
  try {
    // Mark expired rides as inactive
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await Ride.updateMany(
      { date: { $lt: today }, status: { $ne: "inactive" } },
      { status: "inactive" }
    );

    const rides = await Ride.find({ status: "active" })
      .populate("driver")
      .select("-createdAt -updatedAt");

    res.json(
      rides.map((ride) => ({
        id: ride._id,
        driverId: ride.driver._id,
        driverName: ride.driver.name,
        driverPhone: ride.driver.phone,
        driverCollege: ride.driver.college,
        pickup: ride.pickup,
        pickupCoords: ride.pickupCoords,
        drop: ride.drop,
        dropCoords: ride.dropCoords,
        date: ride.date,
        time: ride.time,
        seatsAvailable: ride.seatsAvailable,
        pricePerSeat: ride.pricePerSeat,
        status: ride.status,
        details: ride.details
      }))
    );
  } catch (error) {
    console.error("Error fetching rides:", error);
    res.status(500).json({ message: "Failed to fetch rides" });
  }
};

export const getUserRides = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("[DEBUG] Fetching rides for user:", userId);

    const user = await User.findById(userId).populate({
      path: 'myRides',
      populate: [
        { path: 'driver' },
        { path: 'bookedBy' }
      ]
    });

    if (!user) {
      console.log("[DEBUG] User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("[DEBUG] Found user rides count:", user.myRides.length);

    res.json(
      user.myRides.map((ride) => ({
        id: ride._id,
        driverId: ride.driver._id,
        driverName: ride.driver.name,
        driverPhone: ride.driver.phone,
        driverCollege: ride.driver.college,
        pickup: ride.pickup,
        pickupCoords: ride.pickupCoords,
        drop: ride.drop,
        dropCoords: ride.dropCoords,
        date: ride.date,
        time: ride.time,
        seatsAvailable: ride.seatsAvailable,
        pricePerSeat: ride.pricePerSeat,
        status: ride.status,
        details: ride.details,
        bookedUsers: ride.bookedBy && ride.bookedBy.length > 0 
          ? ride.bookedBy.map(u => ({ 
              id: u._id, 
              name: u.name, 
              phone: u.phone 
            }))
          : []
      }))
    );
  } catch (error) {
    console.error("[ERROR] Error fetching user rides:", error);
    res.status(500).json({ message: "Failed to fetch rides" });
  }
};

export const updateRide = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.user.id;

    const ride = await Ride.findById(id);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driver.toString() !== driverId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedRide = await Ride.findByIdAndUpdate(id, req.body, {
      new: true
    }).populate("driver");

    res.json({
      id: updatedRide._id,
      driverId: updatedRide.driver._id,
      driverName: updatedRide.driver.name,
      driverPhone: updatedRide.driver.phone,
      driverCollege: updatedRide.driver.college,
      pickup: updatedRide.pickup,
      drop: updatedRide.drop,
      date: updatedRide.date,
      time: updatedRide.time,
      seatsAvailable: updatedRide.seatsAvailable,
      pricePerSeat: updatedRide.pricePerSeat,
      status: updatedRide.status,
      details: updatedRide.details
    });
  } catch (error) {
    console.error("Error updating ride:", error);
    res.status(500).json({ message: "Failed to update ride" });
  }
};

export const deleteRide = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.user.id;

    const ride = await Ride.findById(id);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driver.toString() !== driverId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Ride.findByIdAndDelete(id);
    res.json({ message: "Ride deleted successfully" });
  } catch (error) {
    console.error("Error deleting ride:", error);
    res.status(500).json({ message: "Failed to delete ride" });
  }
};
