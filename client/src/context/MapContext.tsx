
import React, { createContext, useContext, useState } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [libraries] = useState(['places']);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  return (
    <MapContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => useContext(MapContext);
