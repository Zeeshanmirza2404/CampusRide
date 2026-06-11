import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { MapProvider } from './context/MapContext';
import { RidesProvider } from './context/RidesContext';
import { TrackingProvider } from './context/TrackingContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import OfferRide from './pages/OfferRide';
import FindRide from './pages/FindRide';
import './index.css';
import BookingSuccess from './pages/BookingSuccess';
import LiveTracking from './pages/LiveTracking';

const App: React.FC = () => (
  <AuthProvider>
    <SocketProvider>
      <MapProvider>
        <RidesProvider>
          <TrackingProvider>
            <BrowserRouter>
              <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/offer-ride"
              element={
                <ProtectedRoute>
                  <OfferRide />
                </ProtectedRoute>
              }
            />
            <Route
              path="/find-ride"
              element={
                <ProtectedRoute>
                  <FindRide />
                </ProtectedRoute>
              }
            />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route 
              path="/tracking/:rideId" 
              element={
                <ProtectedRoute>
                  <LiveTracking />
                </ProtectedRoute>
              } 
            />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
          </TrackingProvider>
        </RidesProvider>
      </MapProvider>
    </SocketProvider>
  </AuthProvider>
);

export default App;
