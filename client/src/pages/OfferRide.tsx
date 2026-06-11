import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Autocomplete } from "@react-google-maps/api";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { useRides } from "../context/RidesContext";
import { useMap } from "../context/MapContext";
import { calculateDistance, calculateFare } from "../utils/rideMath";
import { useEffect } from "react";
import { DEV_CONFIG } from "../config/devConfig";

// IST helpers (UTC+5:30)
const getISTDate = () => {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().split("T")[0]; // "YYYY-MM-DD"
};

const getISTTime = () => {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const h = ist.getUTCHours();
  const m = ist.getUTCMinutes();
  const meridiem = h < 12 ? "AM" : "PM";
  const displayH = h % 12 || 12;
  return `${displayH}:${String(m).padStart(2, "0")} ${meridiem}`;
};

const toHHMM = (ampmStr) => {
  if (!ampmStr) return "";
  const [timePart, meridiem] = ampmStr.split(" ");
  if (!meridiem) return ampmStr;
  let [h, m] = timePart.split(":").map(Number);
  if (meridiem === "AM" && h === 12) h = 0;
  if (meridiem === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const OfferRide = () => {
  const { user } = useAuth();
  const { createRide } = useRides();
  const { isLoaded } = useMap();
  const navigate = useNavigate();

  const [pickupAutocomplete, setPickupAutocomplete] = useState(null);
  const [dropAutocomplete, setDropAutocomplete] = useState(null);

  const onPickupLoad = (autocomplete) => setPickupAutocomplete(autocomplete);
  const onDropLoad = (autocomplete) => setDropAutocomplete(autocomplete);

  const onPickupPlaceChanged = () => {
    if (pickupAutocomplete) {
      const place = pickupAutocomplete.getPlace();
      const location = place.geometry?.location;
      setFormData((prev) => ({
        ...prev,
        pickup: place.formatted_address || "",
        pickupCoords: location
          ? { lat: location.lat(), lng: location.lng() }
          : null,
      }));
    }
  };

  const onDropPlaceChanged = () => {
    if (dropAutocomplete) {
      const place = dropAutocomplete.getPlace();
      const location = place.geometry?.location;
      setFormData((prev) => ({
        ...prev,
        drop: place.formatted_address || "",
        dropCoords: location
          ? { lat: location.lat(), lng: location.lng() }
          : null,
      }));
    }
  };

  const [formData, setFormData] = useState({
    pickup: "",
    pickupCoords: null,
    drop: "",
    dropCoords: null,
    date: getISTDate(),
    time: getISTTime(),
    seats: "",
    price: "",
    details: "",
  });

  const [calculatedDistance, setCalculatedDistance] = useState(null);

  useEffect(() => {
    if (formData.pickupCoords && formData.dropCoords) {
      const dist = calculateDistance(
        formData.pickupCoords.lat,
        formData.pickupCoords.lng,
        formData.dropCoords.lat,
        formData.dropCoords.lng,
      );
      setCalculatedDistance(dist);
      // Optional: Auto-suggest price (e.g., ₹5/km)
      // setFormData(prev => ({ ...prev, price: calculateFare(dist, 5) }));
    }
  }, [formData.pickupCoords, formData.dropCoords]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return;

    const result = await createRide({
      pickup: formData.pickup,
      pickupCoords: formData.pickupCoords,
      drop: formData.drop,
      dropCoords: formData.dropCoords,
      date: formData.date,
      time: formData.time,
      seatsAvailable: parseInt(formData.seats),
      pricePerSeat: parseFloat(formData.price),
      details: formData.details,
    });

    if (result.success) {
      navigate("/dashboard");
    } else {
      // Handle error - could add state for error message
      console.error("Failed to create ride:", result.error);
    }
  };

  if (!user || (!isLoaded && !DEV_CONFIG.BYPASS_MAPS))
    return <div>Loading Maps...</div>;

  return (
    <div className="min-vh-100" style={{ background: "var(--bg-light)" }}>
      <PageHeader
        title="Offer a Ride"
        icon="bi-link-45deg"
        iconColor="#2563eb"
      />

      <main className="container py-4">
        <div className="card-custom p-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <i
              className="bi bi-geo-alt-fill mb-1"
              style={{ fontSize: "22px" }}
            ></i>
            <h3 className="mb-0" style={{ fontWeight: 700 }}>
              Drop Your Ride
            </h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Pickup Location</label>
              {DEV_CONFIG.BYPASS_MAPS ? (
                <input
                  type="text"
                  name="pickup"
                  className="form-control form-control-custom"
                  placeholder="e.g., Main Campus Gate"
                  value={formData.pickup}
                  onChange={handleChange}
                  required
                />
              ) : (
                <Autocomplete
                  onLoad={onPickupLoad}
                  onPlaceChanged={onPickupPlaceChanged}
                >
                  <input
                    type="text"
                    name="pickup"
                    className="form-control form-control-custom"
                    placeholder="e.g., Main Campus Gate"
                    value={formData.pickup}
                    onChange={handleChange}
                    required
                  />
                </Autocomplete>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Drop Location</label>
              {DEV_CONFIG.BYPASS_MAPS ? (
                <input
                  type="text"
                  name="drop"
                  className="form-control form-control-custom"
                  placeholder="e.g., Near Bus Stop"
                  value={formData.drop}
                  onChange={handleChange}
                  required
                />
              ) : (
                <Autocomplete
                  onLoad={onDropLoad}
                  onPlaceChanged={onDropPlaceChanged}
                >
                  <input
                    type="text"
                    name="drop"
                    className="form-control form-control-custom"
                    placeholder="e.g., Near Bus Stop"
                    value={formData.drop}
                    onChange={handleChange}
                    required
                  />
                </Autocomplete>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="date"
                className="form-control form-control-custom"
                value={formData.date}
                min={getISTDate()}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Time <span className="text-muted small">(IST)</span>
              </label>
              <input
                type="time"
                name="time"
                className="form-control form-control-custom"
                value={toHHMM(formData.time)}
                min={
                  formData.date === getISTDate()
                    ? toHHMM(getISTTime())
                    : undefined
                }
                onChange={(e) => {
                  const raw = e.target.value;
                  if (!raw) {
                    setFormData((prev) => ({ ...prev, time: "" }));
                    return;
                  }
                  const [hStr, mStr] = raw.split(":");
                  let h = parseInt(hStr, 10);
                  const m = parseInt(mStr, 10);
                  const meridiem = h < 12 ? "AM" : "PM";
                  const displayH = h % 12 || 12;
                  const formatted = `${displayH}:${String(m).padStart(2, "0")} ${meridiem}`;
                  setFormData((prev) => ({ ...prev, time: formatted }));
                }}
                required
              />
              {formData.time && (
                <div
                  className="mt-1 d-flex align-items-center gap-1"
                  style={{ fontSize: "0.82rem", color: "var(--primary-color)" }}
                >
                  <i className="bi bi-clock-fill"></i>
                  <span>
                    Scheduled at <strong>{formData.time} IST</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Available Seats</label>
              <input
                type="number"
                name="seats"
                className="form-control form-control-custom"
                placeholder="e.g., 1"
                min="1"
                max="4"
                value={formData.seats}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Price per Seat (₹)</label>
              <input
                type="number"
                name="price"
                className="form-control form-control-custom"
                placeholder="e.g., 5.00"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">
                Additional Details (Optional)
              </label>
              <textarea
                name="details"
                className="form-control form-control-custom"
                rows={3}
                placeholder="Any message or additional information about the ride, vehicle, or requirements..."
                value={formData.details}
                onChange={handleChange}
              />
            </div>

            <div className="summary-card mb-4 p-3 rounded">
              <h4 className="summary-label mb-2 text-dark">Ride Summary</h4>
              <div className="mb-1 text-dark">
                <strong>Driver:</strong> {user.name}
              </div>
              <div className="mb-1 text-dark">
                <strong>Contact:</strong> {user.phone}
              </div>
            </div>

            <div className="d-flex gap-3">
              <button
                type="button"
                className="btn btn-outline-secondary flex-fill"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary flex-fill">
                Create Ride
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default OfferRide;
