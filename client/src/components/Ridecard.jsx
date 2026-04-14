import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRides } from "../context/RidesContext";
import MapProvider from "../maps/MapProvider";
import { useState } from "react";
import { useTracking } from "../context/TrackingContext";

const RideCard = ({
  driverName,
  driverPhone,
  pickup,
  drop,
  date,
  time,
  seatsAvailable,
  pricePerSeat,
  status,
  details,
  showBookButton = false,
  isOwnRide = false,
  rideId,
  onBook,
  isBooking = false,
  activeTab = null,
  bookingStatus = null,
  bookedUsers = [],
  pickupCoords = null,
  dropCoords = null,
  isPast = false,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookRide } = useRides();
  const { startTrackingSession, trackedRideId, stopTrackingSession } = useTracking();
  const [showMap, setShowMap] = useState(false);
  const [showPassengerDetails, setShowPassengerDetails] = useState(false);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toISOString().split("T")[0];
  };

  const handleBookRide = async () => {
    if (onBook) {
      onBook();
    } else {
      const result = await bookRide(rideId, user.id, {
        name: user.name,
        phone: user.phone,
      });
      if (result.success) {
        const bookingData = {
          id: result.booking.id,
          riderName: driverName,
          phone: driverPhone,
          pickup,
          drop,
          date: `${formatDate(date)} at ${time}`,
          seats: seatsAvailable,
          price: pricePerSeat,
          details: details,
        };

        navigate("/booking-success", {
          state: { booking: bookingData },
        });
      } else {
        alert(result.error);
      }
    }
  };

  return (
    <div
      className={`ride-card ${status === "inactive" || isPast ? "faded" : ""}`}
      style={isPast ? { opacity: 0.6, filter: "grayscale(0.8) sepia(0.2)", pointerEvents: "none" } : {}}
    >
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div className="d-flex gap-1">
          <i className="bi bi-person-circle me-2"></i>
          <h5 className="mb-0" style={{ fontWeight: 600 }}>
            {driverName}
          </h5>
        </div>
        <span className="badge-active">{isPast ? "Expired" : status}</span>
      </div>

      <div className="ride-info-item me-2">
        <i className="bi bi-geo-alt"></i>
        <span>
          {pickup} → {drop}
        </span>
      </div>

      <div className="ride-info-item">
        <i className="bi bi-clock"></i>
        <span>
          {formatDate(date)} at {time}
        </span>
      </div>

      <div className="d-flex gap-4 mt-3">
        <div className="ride-info-item mb-0">
          <i className="bi bi-people"></i>
          <span>{seatsAvailable} seats available</span>
        </div>
        <div className="ride-info-item mb-0">
          <i className="bi bi-currency-rupee"></i>
          <span>₹{pricePerSeat}/seat</span>
        </div>
      </div>

      {!isPast && activeTab === "bookings" && isBooking ? (
        <div className="mt-3">
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-success btn-sm"
              title="Booking details"
              onClick={() => {
                const bookingData = {
                  id: rideId,
                  riderName: driverName,
                  phone: driverPhone,
                  pickup,
                  drop,
                  date: `${formatDate(date)} at ${time}`,
                  seats: seatsAvailable,
                  price: pricePerSeat,
                  details: details,
                };
                navigate("/booking-success", {
                  state: { booking: bookingData },
                });
              }}
            >
              <i className="bi bi-check-circle"></i>{" "}
              {bookingStatus || "Confirmed"}
            </button>
            <button
              className={`btn btn-sm ${
                trackedRideId === rideId ? "btn-primary shadow-sm" : "btn-outline-secondary"
              }`}
              onClick={() => {
                if (trackedRideId === rideId) {
                  stopTrackingSession();
                } else {
                  startTrackingSession(rideId, "rider");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              <i className={`bi ${trackedRideId === rideId ? "bi-geo-alt-fill" : "bi-geo-alt"}`}></i>{" "}
              {trackedRideId === rideId ? "Tracking Active" : "Track Connection"}
            </button>
          </div>
        </div>
      ) : !isPast && activeTab === "rides" &&
        isOwnRide &&
        bookedUsers &&
        bookedUsers.length > 0 ? (
        <div className="mt-3">
          <button
            className={`btn btn-sm d-inline-flex align-items-center gap-2 ${
              showPassengerDetails
                ? "btn-light border"
                : "btn-outline-secondary"
            }`}
            onClick={() => setShowPassengerDetails(!showPassengerDetails)}
          >
            <span>
              <i className="bi bi-people-fill me-2"></i>
              Passenger Details ({bookedUsers.length})
            </span>
            <i
              className={`bi ${
                showPassengerDetails ? "bi-chevron-up" : "bi-chevron-down"
              }`}
            ></i>
          </button>

          {showPassengerDetails && (
            <div className="card mt-2 bg-light border-0">
              <div className="card-body p-3">
                <h6 className="card-subtitle mb-3 text-muted">
                  Booked Passengers
                </h6>
                {bookedUsers.map((user, index) => (
                  <div
                    key={index}
                    className={`d-flex align-items-center ${
                      index !== 0 ? "mt-3 pt-3 border-top" : ""
                    }`}
                  >
                    <div className="bg-white rounded-circle p-2 me-3 shadow-sm text-primary">
                      <i className="bi bi-person-fill h5 mb-0"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="mb-1">
                        <label className="text-muted small d-block mb-0">
                          Name
                        </label>
                        <span className="fw-medium">
                          {user.name || "Unknown"}
                        </span>
                      </div>
                      {user.phone && (
                        <div>
                          <label className="text-muted small d-block mb-0">
                            Phone
                          </label>
                          <a
                            href={`tel:${user.phone}`}
                            className="text-decoration-none text-dark fw-medium"
                          >
                            {user.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="mt-4 pt-3 border-top">
                  <button 
                    className={`btn btn-sm w-100 ${trackedRideId === rideId ? 'btn-danger shadow-sm' : 'btn-success shadow-sm'}`}
                    onClick={() => {
                      if (trackedRideId === rideId) {
                        stopTrackingSession();
                      } else {
                        startTrackingSession(rideId, "driver");
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  >
                    <i className="bi bi-broadcast me-2"></i> 
                    {trackedRideId === rideId ? "Stop Broadcasting" : "Start Live Operation"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Map Visualization */}
      {!isPast && showMap && pickupCoords && dropCoords && (
        <div className="mt-3">
          <div className="mb-3">
            <MapProvider
              center={pickupCoords}
              markers={[
                { ...pickupCoords, label: "Pickup: " + pickup },
                { ...dropCoords, label: "Drop: " + drop },
              ]}
              polylinePath={[pickupCoords, dropCoords]}
            />
          </div>
        </div>
      )}

      {!isPast && showBookButton && !isOwnRide && seatsAvailable > 0 && (
        <button className="btn btn-primary w-100 mt-3" onClick={handleBookRide}>
          Book Ride (₹{pricePerSeat})
        </button>
      )}
    </div>
  );
};

export default RideCard;
