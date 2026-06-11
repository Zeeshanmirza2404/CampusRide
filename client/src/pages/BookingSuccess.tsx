import React from "react";
import { useLocation, Link } from "react-router-dom";

const BookingSuccess = () => {
  const { state } = useLocation();
  const [copied, setCopied] = React.useState(false);
  const booking = state?.booking;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!booking) {
    return (
      <div className="container text-center mt-5">
        <h4>No booking found</h4>
        <Link to="/dashboard" className="btn btn-primary mt-3">
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center">
      <div className="col-md-6">
        <div className="card shadow-lg p-5 text-center border-0 rounded-4">
          <div className="mb-4">
            <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm" style={{ width: '80px', height: '80px' }}>
              <i className="bi bi-check-lg text-success" style={{ fontSize: "40px" }}></i>
            </div>
          </div>

          <h2 className="fw-bold text-dark">Booking Confirmed!</h2>
          <p className="text-muted-custom mb-5 px-3">Your ride has been booked.</p>

          <div className="bg-light-custom rounded-4 p-4 text-start mb-4 border border-light shadow-sm position-relative">
            <div className="row g-3">
               <div className="col-6">
                 <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Driver</small>
                 <span className="fw-bold">{booking.driverName}</span>
               </div>
               <div className="col-6">
                 <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Contact Number</small>
                 <div className="d-flex align-items-center gap-2">
                   <span className="fw-bold">{booking.driverPhone}</span>
                   <button 
                     className="btn btn-sm btn-light p-1 border-0 rounded-circle shadow-sm" 
                     onClick={() => handleCopy(booking.driverPhone)}
                     title="Copy contact number"
                   >
                     {copied ? <i className="bi bi-check-circle-fill text-success"></i> : <i className="bi bi-copy text-muted"></i>}
                   </button>
                 </div>
               </div>
               <div className="col-12 border-top pt-2">
                 <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Route</small>
                 <span className="small text-dark fw-medium">{booking.pickup} <i className="bi bi-arrow-right mx-1 small"></i> {booking.drop}</span>
               </div>
               <div className="col-6">
                 <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Price</small>
                 <span className="fw-bold text-success">₹{booking.price}</span>
               </div>
               <div className="col-6 text-end">
                 <small className="text-muted d-block text-uppercase fw-bold px-3" style={{ fontSize: '0.7rem' }}>Status</small>
                 <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1">Ready</span>
               </div>
            </div>
          </div>

          <Link to="/dashboard" className="btn btn-primary w-100 py-3 rounded-3 shadow fw-bold">
            GO TO DASHBOARD
          </Link>

          <p className="text-muted small mt-3">
            Booking ID: <span className="font-monospace">{booking.id}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
