import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";
import { useSocket } from "./SocketContext";
import { isRidePast } from "../utils/dateUtils";

const RidesContext = createContext(undefined);

export const RidesProvider = ({ children }) => {
  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [userRides, setUserRides] = useState([]);
  const { socket } = useSocket();

  const fetchRides = async () => {
    try {
      const response = await API.get("/rides");
      setRides(response.data);
    } catch (error) {
      console.error("Error fetching rides:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await API.get("/bookings");
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchUserRides = async () => {
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
  // This prevents race conditions and premature API calls
  useEffect(() => {
    const token = localStorage.getItem("campusride_token");
    if (token) {
      // Add small delay to ensure auth context is fully initialized
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

    socket.on("ride_updated", ({ rideId, seatsAvailable }) => {
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

  const createRide = async (rideData) => {
    try {
      const response = await API.post("/rides", {
        pickup: rideData.pickup,
        drop: rideData.drop,
        date: rideData.date,
        time: rideData.time,
        seatsAvailable: rideData.seatsAvailable,
        pricePerSeat: rideData.pricePerSeat,
        details: rideData.details,
      });
      // Fetch updated rides from server
      await fetchRides();
      await fetchUserRides();
      return { success: true };
    } catch (error) {
      console.error("Error creating ride:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to create ride",
      };
    }
  };

  const bookRide = async (rideId, passengerData = {}) => {
    try {
      const response = await API.post("/bookings", {
        rideId,
        passengerName: passengerData.name,
        passengerPhone: passengerData.phone,
      });
      // Fetch updated rides and bookings
      await fetchRides();
      await fetchBookings();
      return { success: true, booking: response.data };
    } catch (error) {
      console.error("Error booking ride:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to book ride",
      };
    }
  };

  const initiatePayment = async (amount) => {
    try {
      const response = await API.post("/payments/create-order", { amount });
      return { success: true, order: response.data };
    } catch (error) {
      console.error("Error creating payment order:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to initiate payment",
      };
    }
  };

  const getUserRides = (userId) => {
    return rides.filter((r) => r.driverId === userId);
  };

  const getUserBookings = (userId) => {
    return bookings
      .filter((b) => b.passengerId === userId)
      .map((booking) => {
        // The booking already contains the populated ride object from the backend
        // We ensure the structure matches what the UI expects
        return booking;
      });
  };

  const getBookingUsersForRide = (rideId) => {
    return bookings.filter((b) => b.rideId === rideId);
  };

  const getFirstBookedUserForRide = (rideId) => {
    const booking = bookings.find((b) => b.rideId === rideId);
    return booking || null;
  };

  const searchRides = (from, to, date) => {
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

export const useRides = () => {
  const context = useContext(RidesContext);
  if (!context) {
    throw new Error("useRides must be used within RidesProvider");
  }
  return context;
};
