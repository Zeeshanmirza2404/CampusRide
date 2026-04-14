
import React from 'react';

const GoogleMap = ({ center, markers, polylinePath }) => {
  return (
    <div 
      style={{ 
        height: '400px', 
        width: '100%', 
        borderRadius: '10px',
        backgroundColor: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: '#6b7280'
      }}
    >
      <i className="bi bi-geo-alt" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
      <h5>Google Maps Provider (Placeholder)</h5>
      <p>Switch MAP_PROVIDER to 'leaflet' to see appropriate map.</p>
    </div>
  );
};

export default GoogleMap;
