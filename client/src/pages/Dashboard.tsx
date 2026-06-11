import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header";
import RideCard from "../components/Ridecard";
import EmptyState from "../components/EmptyState";
import DashboardMapPanel from "../components/DashboardMapPanel";
import { useAuth } from "../context/AuthContext";
import { useRides } from "../context/RidesContext";
import { isRidePast } from "../utils/dateUtils";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { getUserRides, getUserBookings, rides, userRides } = useRides();
  const navigate = useNavigate();
  
  // Determine default tab based on role and available features
  const isDriver = user?.role === 'driver' || user?.role === 'both';
  const isRider = user?.role === 'rider' || user?.role === 'both' || (user?.role as string) === 'bus_rider';
  
  const [activeTab, setActiveTab] = useState(isDriver ? "rides" : "bookings");
  const [showPastRides, setShowPastRides] = useState(false);
  const [showPastBookings, setShowPastBookings] = useState(false);
  const [pastDateFilter, setPastDateFilter] = useState("");

  if (!user) return null;

  const myRides = userRides
    .map(ride => ({ ...ride, isPast: isRidePast(ride.date, ride.time) }))
    .sort((a, b) => (new Date(`${b.date}T${b.time}`) as any) - (new Date(`${a.date}T${a.time}`) as any));

  const activeRides = myRides.filter(r => !r.isPast);
  const pastRides = myRides.filter(r => r.isPast);

  // TODO: type this properly
  const myBookings = (getUserBookings(user.id) as any[])
    .map(booking => ({ ...booking, isPast: isRidePast(booking.ride.date, booking.ride.time) }))
    .sort((a, b) => (new Date(`${b.ride.date}T${b.ride.time}`) as any) - (new Date(`${a.ride.date}T${a.ride.time}`) as any));

  const activeBookings = myBookings.filter(b => !b.isPast);
  const pastBookings = myBookings.filter(b => b.isPast);

  const filteredPastRides = pastRides.filter(r => {
    if (!pastDateFilter) return true;
    try {
      const rideDateStr = new Date(r.date).toISOString().split('T')[0];
      return rideDateStr === pastDateFilter;
    } catch(e) { return true; }
  });

  const filteredPastBookings = pastBookings.filter(b => {
    if (!pastDateFilter) return true;
    try {
      const rideDateStr = new Date(b.ride.date).toISOString().split('T')[0];
      return rideDateStr === pastDateFilter;
    } catch(e) { return true; }
  });

  return (
    <div className="min-vh-100" style={{ background: "var(--bg-light)" }}>
      <Header />

      <main className="container py-4">
        {/* Top 2-Column Section */}
        <div className="row g-4 mb-4 align-items-stretch">
          
          {/* Left Column: Welcome & Actions */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="col-lg-4 d-flex flex-column gap-3"
          >
            <div className="card-custom p-4 bg-white border-0 shadow-sm flex-grow-1 d-flex flex-column justify-content-center">
              <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--primary-color)" }}>
                Welcome back, {user.name}!
              </h2>
              <p className="text-muted-custom mb-0">
                Manage your rides and track locations from your dashboard.
              </p>
            </div>

            {isDriver && (
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                className="card-custom card-clickable p-4 border-0 shadow-sm"
                onClick={() => navigate("/offer-ride")}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm flex-shrink-0" style={{ width: '48px', height: '48px', fontSize: '24px' }}>
                    <i className="bi bi-plus-lg"></i>
                  </div>
                  <div>
                    <h5 className="mb-1 fw-bold">Offer a Ride</h5>
                    <p className="text-muted-custom mb-0" style={{ fontSize: "14px" }}>
                      Share your ride and help fellow students
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {isRider && (
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                className="card-custom card-clickable p-4 border-0 shadow-sm"
                onClick={() => navigate("/find-ride")}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm flex-shrink-0" style={{ width: '48px', height: '48px', fontSize: '20px' }}>
                    <i className="bi bi-search"></i>
                  </div>
                  <div>
                    <h5 className="mb-1 fw-bold">Find a Ride</h5>
                    <p className="text-muted-custom mb-0" style={{ fontSize: "14px" }}>
                      Browse available rides in your area
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Right Column: Tracking Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="col-lg-8"
          >
             <DashboardMapPanel />
          </motion.div>

        </div>

        {/* Bottom Section: Dashboard Listings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ul className="nav nav-tabs-custom mb-4">
            {isDriver && (
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "rides" ? "active fw-bold" : ""}`}
                  onClick={() => setActiveTab("rides")}
                >
                  My Rides
                </button>
              </li>
            )}
            {isRider && (
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "bookings" ? "active fw-bold" : ""}`}
                  onClick={() => setActiveTab("bookings")}
                >
                  My Bookings
                </button>
              </li>
            )}
          </ul>

          <div className="row">
            <div className="col-12">
              {/* Rides Tab Content */}
              {isDriver && activeTab === "rides" && (
                <>
                  {activeRides.length === 0 ? (
                    <EmptyState
                      icon="bi-car-front"
                      title="No active rides"
                      description="Start offering rides to help your fellow students"
                      buttonText="Offer Your First Ride"
                      buttonIcon="bi-plus"
                      onButtonClick={() => navigate("/offer-ride")}
                    />
                  ) : (
                    activeRides.map((ride) => (
                        <RideCard
                          key={ride.id}
                          {...ride}
                          isBooking={false}
                          isOwnRide={true}
                          activeTab={activeTab}
                          rideId={ride.id}
                        />
                    ))
                  )}

                  {pastRides.length > 0 && (
                    <div className="mt-5">
                      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                        <button 
                          className="btn btn-outline-secondary d-flex align-items-center gap-2"
                          onClick={() => setShowPastRides(!showPastRides)}
                        >
                          <i className={`bi bi-chevron-${showPastRides ? 'up' : 'down'}`}></i>
                          Past Rides ({pastRides.length})
                        </button>
                        {showPastRides && (
                          <div className="d-flex align-items-center gap-2">
                            <label className="text-muted fw-bold mb-0 small">Filter by Date:</label>
                            <input 
                              type="date" 
                              className="form-control form-control-sm" 
                              value={pastDateFilter}
                              onChange={(e) => setPastDateFilter(e.target.value)}
                            />
                            {pastDateFilter && (
                              <button className="btn btn-sm btn-light text-danger" onClick={() => setPastDateFilter("")}>
                                Clear
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {showPastRides && (
                        <div>
                          {filteredPastRides.length === 0 && pastDateFilter ? (
                             <div className="text-center text-muted py-4">No expired rides found for this date.</div>
                          ) : (
                            filteredPastRides.map((ride) => (
                              <RideCard
                                key={ride.id}
                                {...ride}
                                isBooking={false}
                                isOwnRide={true}
                                activeTab={activeTab}
                                rideId={ride.id}
                              />
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Bookings Tab Content */}
              {isRider && activeTab === "bookings" && (
                <>
                  {activeBookings.length === 0 ? (
                    <EmptyState
                      icon="bi-search"
                      title="No active bookings"
                      description="Find and book rides with your fellow students"
                      buttonText="Find Your First Ride"
                      buttonIcon="bi-search"
                      onButtonClick={() => navigate("/find-ride")}
                    />
                  ) : (
                    activeBookings.map((booking) => (
                      <RideCard
                        key={booking.id}
                        {...booking.ride}
                        driverName={booking.ride.driverName}
                        driverPhone={booking.ride.driverPhone}
                        pickup={booking.ride.pickup}
                        pickupCoords={booking.ride.pickupCoords}
                        drop={booking.ride.drop}
                        dropCoords={booking.ride.dropCoords}
                        date={booking.ride.date}
                        time={booking.ride.time}
                        seatsAvailable={booking.ride.seatsAvailable}
                        pricePerSeat={booking.ride.pricePerSeat}
                        status={booking.ride.status}
                        isBooking={true}
                        isOwnRide={false}
                        rideId={booking.rideId}
                        activeTab={activeTab}
                        bookingStatus="Booking Successful"
                        isPast={booking.isPast}
                        details={booking.ride.details}
                      />
                    ))
                  )}

                  {pastBookings.length > 0 && (
                    <div className="mt-5">
                      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                        <button 
                          className="btn btn-outline-secondary d-flex align-items-center gap-2"
                          onClick={() => setShowPastBookings(!showPastBookings)}
                        >
                          <i className={`bi bi-chevron-${showPastBookings ? 'up' : 'down'}`}></i>
                          Past Bookings ({pastBookings.length})
                        </button>
                        {showPastBookings && (
                          <div className="d-flex align-items-center gap-2">
                            <label className="text-muted fw-bold mb-0 small">Filter by Date:</label>
                            <input 
                              type="date" 
                              className="form-control form-control-sm" 
                              value={pastDateFilter}
                              onChange={(e) => setPastDateFilter(e.target.value)}
                            />
                            {pastDateFilter && (
                              <button className="btn btn-sm btn-light text-danger" onClick={() => setPastDateFilter("")}>
                                Clear
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {showPastBookings && (
                        <div>
                          {filteredPastBookings.length === 0 && pastDateFilter ? (
                             <div className="text-center text-muted py-4">No expired bookings found for this date.</div>
                          ) : (
                            filteredPastBookings.map((booking) => (
                              <RideCard
                                key={booking.id}
                                {...booking.ride}
                                driverName={booking.ride.driverName}
                                driverPhone={booking.ride.driverPhone}
                                pickup={booking.ride.pickup}
                                pickupCoords={booking.ride.pickupCoords}
                                drop={booking.ride.drop}
                                dropCoords={booking.ride.dropCoords}
                                date={booking.ride.date}
                                time={booking.ride.time}
                                seatsAvailable={booking.ride.seatsAvailable}
                                pricePerSeat={booking.ride.pricePerSeat}
                                status={booking.ride.status}
                                isBooking={true}
                                isOwnRide={false}
                                rideId={booking.rideId}
                                activeTab={activeTab}
                                bookingStatus="Booking Successful"
                                isPast={booking.isPast}
                                details={booking.ride.details}
                              />
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
