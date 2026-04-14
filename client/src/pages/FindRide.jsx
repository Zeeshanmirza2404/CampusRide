import React, { useState } from "react";
import { Autocomplete } from "@react-google-maps/api";
import PageHeader from "../components/PageHeader";
import RideCard from "../components/Ridecard";
import { useAuth } from "../context/AuthContext";
import { useRides } from "../context/RidesContext";
import { useMap } from "../context/MapContext";
import { DEV_CONFIG } from "../config/devConfig";
import { useNavigate } from "react-router-dom";

const FindRide = () => {
  const { user } = useAuth();
  const { searchRides, bookRide, initiatePayment } = useRides();
  const { isLoaded } = useMap();
  const navigate = useNavigate();

  const [autocompleteFrom, setAutocompleteFrom] = useState(null);
  const [autocompleteTo, setAutocompleteTo] = useState(null);

  const onFromLoad = (autocomplete) => setAutocompleteFrom(autocomplete);
  const onToLoad = (autocomplete) => setAutocompleteTo(autocomplete);

  const onFromPlaceChanged = () => {
    if (autocompleteFrom) {
      const place = autocompleteFrom.getPlace();
      setFilters(prev => ({ ...prev, from: place.formatted_address || "" }));
    }
  };

  const onToPlaceChanged = () => {
    if (autocompleteTo) {
      const place = autocompleteTo.getPlace();
      setFilters(prev => ({ ...prev, to: place.formatted_address || "" }));
    }
  };

  const [filters, setFilters] = useState({
    from: "",
    to: "",
    date: "",
  });
  const [message, setMessage] = useState(null);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const clearFilters = () => {
    setFilters({ from: "", to: "", date: "" });
  };

  const handleBookRide = async (rideId, price) => {
    if (!user) return;

    // Check for Bypass
    if (DEV_CONFIG.BYPASS_PAYMENT) {
      console.log("DEV: Bypassing Payment");
      const bookingResult = await bookRide(rideId, {
        name: user.name,
        phone: user.phone,
      });

      if (bookingResult.success) {
        setMessage({
          type: "success",
          text: "Booking Successful (Payment Bypassed)",
        });
        // Navigate to Success Page
        setTimeout(() => {
          navigate("/booking-success", { state: { booking: bookingResult.booking } });
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: bookingResult.error || "Booking failed",
        });
      }
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Load Razorpay Script
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const res = await loadRazorpay();

    if (!res) {
      setMessage({ type: "error", text: "Razorpay SDK failed to load" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Initiate Payment Order
    const orderResult = await initiatePayment(price);

    if (!orderResult.success) {
      setMessage({ type: "error", text: "Failed to initiate payment" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderResult.order.amount,
      currency: "INR",
      name: "CampusRide",
      description: "Ride Booking Payment",
      order_id: orderResult.order.id,
      handler: async function (response) {
        // On Payment Success -> Create Booking
        const bookingResult = await bookRide(rideId, {
            name: user.name,
            phone: user.phone,
        });

        if (bookingResult.success) {
            setMessage({
                type: "success",
                text: `Payment & Booking Successful! ID: ${response.razorpay_payment_id}`,
            });
            // Navigate to Success Page after short delay
            setTimeout(() => {
              navigate("/booking-success", { state: { booking: bookingResult.booking } });
            }, 1500);
        } else {
            setMessage({
                type: "error",
                text: "Payment successful but booking failed. Please contact support.",
            });
        }
        setTimeout(() => setMessage(null), 3000);
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone,
      },
      theme: {
        color: "#2563eb",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const availableRides = searchRides(
    filters.from || undefined,
    filters.to || undefined,
    filters.date || undefined
  );

  if (!user || (!isLoaded && !DEV_CONFIG.BYPASS_MAPS)) return <div>Loading Maps...</div>;

  return (
    <div className="min-vh-100" style={{ background: "var(--bg-light)" }}>
      <PageHeader title="Find a Ride" icon="bi-search" iconColor="#2563eb" />

      <main className="container py-4">
        {message && (
          <div
            className={`alert alert-${
              message.type === "success" ? "success" : "danger"
            } mb-4`}
          >
            {message.text}
          </div>
        )}

        <div className="card-custom p-4 mb-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <i
              className="bi bi-funnel"
              style={{ fontSize: "24px"}}
            ></i>
            <h3 className="mb-0" style={{ fontWeight: 700 }}>
              Find Your Ride
            </h3>
          </div>

          <div className="mb-3">
            <label className="form-label">From</label>
            {DEV_CONFIG.BYPASS_MAPS ? (
              <input
                type="text"
                name="from"
                className="form-control form-control-custom"
                placeholder="Pickup location"
                value={filters.from}
                onChange={handleFilterChange}
              />
            ) : (
              <Autocomplete
                onLoad={onFromLoad}
                onPlaceChanged={onFromPlaceChanged}
              >
                <input
                  type="text"
                  name="from"
                  className="form-control form-control-custom"
                  placeholder="Pickup location"
                  value={filters.from}
                  onChange={handleFilterChange}
                />
              </Autocomplete>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">To</label>
            {DEV_CONFIG.BYPASS_MAPS ? (
              <input
                type="text"
                name="to"
                className="form-control form-control-custom"
                placeholder="Drop location"
                value={filters.to}
                onChange={handleFilterChange}
              />
            ) : (
              <Autocomplete
                onLoad={onToLoad}
                onPlaceChanged={onToPlaceChanged}
              >
                <input
                  type="text"
                  name="to"
                  className="form-control form-control-custom"
                  placeholder="Drop location"
                  value={filters.to}
                  onChange={handleFilterChange}
                />
              </Autocomplete>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label">Date</label>
            <input
              type="date"
              name="date"
              className="form-control form-control-custom"
              value={filters.date}
              onChange={handleFilterChange}
            />
          </div>

          <button
            className="btn btn-outline-secondary w-100"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>

        <div className="mb-4">
          <h4 style={{ fontWeight: 600 }}>Available Rides</h4>
          <p className="text-muted-custom">
            {availableRides.length} ride{availableRides.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        </div>

        {availableRides.length === 0 ? (
          <div className="card-custom p-4 text-center">
            <i
              className="bi bi-car-front"
              style={{ fontSize: "48px", color: "var(--text-muted)" }}
            ></i>
            <h5 className="mt-3">No rides available</h5>
            <p className="text-muted-custom">
              Try adjusting your filters or check back later
            </p>
          </div>
        ) : (
          availableRides.map((ride) => (
            <RideCard
              key={ride.id}
              driverName={ride.driverName}
              driverPhone={ride.driverPhone}
              pickup={ride.pickup}
              drop={ride.drop}
              date={ride.date}
              time={ride.time}
              seatsAvailable={ride.seatsAvailable}
              pricePerSeat={ride.pricePerSeat}
              status={ride.status}
              showBookButton={true}
              isOwnRide={ride.driverId === user.id}
              onBook={() => handleBookRide(ride.id, ride.pricePerSeat)}
              details={ride.details}
            />
          ))
        )}
      </main>
    </div>
  );
};

export default FindRide;
