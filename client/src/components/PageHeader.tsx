import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  icon: string;
  iconColor?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, icon, iconColor = '#2563eb' }) => {
  const navigate = useNavigate();

  return (
    <div className="page-header">
      <div className="container">
        <div className="d-flex align-items-center gap-3">
          <button 
            className="back-link btn btn-link p-0 text-decoration-none"
            onClick={() => navigate('/dashboard')}
          >
            <i className="bi bi-arrow-left"></i>
            Back to Dashboard
          </button>
          <div className="d-flex align-items-center gap-2">
            <i className={`bi ${icon}`} style={{ color: iconColor, fontSize: '20px' }}></i>
            <span style={{ fontWeight: 600, fontSize: '18px' }}>{title}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
