import { Request, Response } from "express";
import Ride from "../models/Ride.js";
import User from "../models/User.js";

export const createRide = async (req: Request, res: Response): Promise<any> => {
  try {
    const { pickup, drop, pickupCoords, dropCoords, date, time, seatsAvailable, pricePerSeat, details } = req.body;
    const driverId = req.user!.id;

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
    const populatedRideAny = populatedRide as any; // TODO: type this properly

    res.status(201).json({
      id: populatedRideAny._id,
      driverId: populatedRideAny.driver._id,
      driverName: populatedRideAny.driver.name,
      driverPhone: populatedRideAny.driver.phone,
      driverCollege: populatedRideAny.driver.college,
      pickup: populatedRideAny.pickup,
      pickupCoords: populatedRideAny.pickupCoords,
      drop: populatedRideAny.drop,
      dropCoords: populatedRideAny.dropCoords,
      date: populatedRideAny.date,
      time: populatedRideAny.time,
      seatsAvailable: populatedRideAny.seatsAvailable,
      pricePerSeat: populatedRideAny.pricePerSeat,
      status: populatedRideAny.status,
      details: populatedRideAny.details
    });
  } catch (error) {
    console.error("Error creating ride:", error);
    res.status(500).json({ message: "Failed to create ride" });
  }
};

export const getRides = async (req: Request, res: Response): Promise<any> => {
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
      rides.map((ride: any) => ({ // TODO: type this properly
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

export const getUserRides = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;
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
      (user.myRides as any[]).map((ride) => ({ // TODO: type this properly
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
          ? ride.bookedBy.map((u: any) => ({ 
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

export const updateRide = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const driverId = req.user!.id;

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
    const updatedRideAny = updatedRide as any; // TODO: type this properly

    res.json({
      id: updatedRideAny._id,
      driverId: updatedRideAny.driver._id,
      driverName: updatedRideAny.driver.name,
      driverPhone: updatedRideAny.driver.phone,
      driverCollege: updatedRideAny.driver.college,
      pickup: updatedRideAny.pickup,
      drop: updatedRideAny.drop,
      date: updatedRideAny.date,
      time: updatedRideAny.time,
      seatsAvailable: updatedRideAny.seatsAvailable,
      pricePerSeat: updatedRideAny.pricePerSeat,
      status: updatedRideAny.status,
      details: updatedRideAny.details
    });
  } catch (error) {
    console.error("Error updating ride:", error);
    res.status(500).json({ message: "Failed to update ride" });
  }
};

export const deleteRide = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const driverId = req.user!.id;

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
