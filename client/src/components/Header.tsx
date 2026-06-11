import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header-nav">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div className="logo-text" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
              <i className="bi bi-car-front logo-icon"></i>
              CampusRide
            </div>
          </div>
          
          <button 
            className="btn btn-link text-decoration-none d-flex align-items-center gap-2 logout-btn"
            onClick={handleLogout}
            style={{ color: 'var(--text-dark)', transition: 'all 0.2s ease' }}
          >
            <i className="bi bi-box-arrow-right fs-4"></i>
            <span className="d-none d-md-inline fw-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
