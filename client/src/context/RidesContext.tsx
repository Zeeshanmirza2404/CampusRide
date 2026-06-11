import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import API from "../services/api";
import { useSocket } from "./SocketContext";
import { isRidePast } from "../utils/dateUtils";

interface Ride {
  id: string;
  driverId: string;
  driverName?: string;
  driverPhone?: string;
  driverCollege?: string;
  pickup: string;
  drop: string;
  date: string;
  time: string;
  seatsAvailable: number;
  pricePerSeat: number;
  status: string;
  details?: string;
  pickupCoords?: { lat: number; lng: number };
  dropCoords?: { lat: number; lng: number };
}

interface Booking {
  id: string;
  rideId: string;
  passengerId: string;
  passengerName?: string;
  passengerPhone?: string;
  status: string;
  ride?: Ride;
}

interface PassengerData {
  name?: string;
  phone?: string;
}

interface ActionResult {
  success: boolean;
  error?: string;
  booking?: any;
  order?: any;
}

interface RidesContextType {
  rides: Ride[];
  bookings: Booking[];
  userRides: Ride[];
  createRide: (rideData: Partial<Ride>) => Promise<ActionResult>;
  bookRide: (rideId: string, passengerData?: PassengerData) => Promise<ActionResult>;
  initiatePayment: (amount: number) => Promise<ActionResult>;
  getUserRides: (userId: string) => Ride[];
  getUserBookings: (userId: string) => Booking[];
  searchRides: (from?: string, to?: string, date?: string) => Ride[];
  getBookingUsersForRide: (rideId: string) => Booking[];
  getFirstBookedUserForRide: (rideId: string) => Booking | null;
}

const RidesContext = createContext<RidesContextType | undefined>(undefined);

export const RidesProvider = ({ children }: { children: ReactNode }) => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userRides, setUserRides] = useState<Ride[]>([]);
  const socketCtx = useSocket();
  const socket = socketCtx?.socket;

  const fetchRides = async (): Promise<void> => {
    try {
      const response = await API.get("/rides");
      setRides(response.data);
    } catch (error) {
      console.error("Error fetching rides:", error);
    }
  };

  const fetchBookings = async (): Promise<void> => {
    try {
      const response = await API.get("/bookings");
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchUserRides = async (): Promise<void> => {
    try {
      const response = await API.get("/rides/user");
      setUserRides(response.data);
    } catch (error) {
      console.error("Error fetching user rides:", error);
    }
  };

  // Fetch public rides immediately on mount
  useEffect(() => {
    fetchRides();
  }, []);

  // Fetch protected resources only when authenticated
  useEffect(() => {
    const token = localStorage.getItem("campusride_token");
    if (token) {
      const timer = setTimeout(() => {
        fetchBookings();
        fetchUserRides();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for real-time ride updates
  useEffect(() => {
    if (!socket) return;

    socket.on("ride_updated", ({ rideId, seatsAvailable }: { rideId: string; seatsAvailable: number }) => {
      setRides((prevRides) =>
        prevRides.map((ride) =>
          ride.id === rideId ? { ...ride, seatsAvailable } : ride
        )
      );
    });

    return () => {
      socket.off("ride_updated");
    };
  }, [socket]);

  const createRide = async (rideData: Partial<Ride>): Promise<ActionResult> => {
    try {
      await API.post("/rides", {
        pickup: rideData.pickup,
        drop: rideData.drop,
        date: rideData.date,
        time: rideData.time,
        seatsAvailable: rideData.seatsAvailable,
        pricePerSeat: rideData.pricePerSeat,
        details: rideData.details,
      });
      await fetchRides();
      await fetchUserRides();
      return { success: true };
    } catch (error: any) {
      console.error("Error creating ride:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to create ride",
      };
    }
  };

  const bookRide = async (rideId: string, passengerData: PassengerData = {}): Promise<ActionResult> => {
    try {
      const response = await API.post("/bookings", {
        rideId,
        passengerName: passengerData.name,
        passengerPhone: passengerData.phone,
      });
      await fetchRides();
      await fetchBookings();
      return { success: true, booking: response.data };
    } catch (error: any) {
      console.error("Error booking ride:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to book ride",
      };
    }
  };

  const initiatePayment = async (amount: number): Promise<ActionResult> => {
    try {
      const response = await API.post("/payments/create-order", { amount });
      return { success: true, order: response.data };
    } catch (error: any) {
      console.error("Error creating payment order:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to initiate payment",
      };
    }
  };

  const getUserRides = (userId: string): Ride[] => {
    return rides.filter((r) => r.driverId === userId);
  };

  const getUserBookings = (userId: string): Booking[] => {
    return bookings
      .filter((b) => b.passengerId === userId)
      .map((booking) => booking);
  };

  const getBookingUsersForRide = (rideId: string): Booking[] => {
    return bookings.filter((b) => b.rideId === rideId);
  };

  const getFirstBookedUserForRide = (rideId: string): Booking | null => {
    const booking = bookings.find((b) => b.rideId === rideId);
    return booking || null;
  };

  const searchRides = (from?: string, to?: string, date?: string): Ride[] => {
    return rides.filter((ride) => {
      if (ride.status !== "active" || ride.seatsAvailable <= 0) return false;
      if (isRidePast(ride.date, ride.time)) return false;
      if (from && !ride.pickup.toLowerCase().includes(from.toLowerCase()))
        return false;
      if (to && !ride.drop.toLowerCase().includes(to.toLowerCase()))
        return false;
      if (date && ride.date !== date) return false;
      return true;
    });
  };

  return (
    <RidesContext.Provider
      value={{
        rides,
        bookings,
        userRides,
        createRide,
        bookRide,
        initiatePayment,
        getUserRides,
        getUserBookings,
        searchRides,
        getBookingUsersForRide,
        getFirstBookedUserForRide,
      }}
    >
      {children}
    </RidesContext.Provider>
  );
};

export const useRides = (): RidesContextType => {
  const context = useContext(RidesContext);
  if (!context) {
    throw new Error("useRides must be used within RidesProvider");
  }
  return context;
};
