import React from 'react';
import { MAP_PROVIDER } from './mapConfig';
import LeafletMap from './LeafletMap';
import GoogleMap from './GoogleMap';

interface MapProviderProps {
  center?: { lat: number; lng: number };
  driverLocation?: { lat: number; lng: number } | null;
  riderLocation?: { lat: number; lng: number } | null;
  pickupCoords?: { lat: number; lng: number } | null;
  dropCoords?: { lat: number; lng: number } | null;
  rideStatus?: string | null;
  markers?: any[];
  polylinePath?: any[];
}

const MapProvider: React.FC<MapProviderProps> = (props) => {
  if (MAP_PROVIDER === 'leaflet') {
    return <LeafletMap {...props} />;
  }
  return <GoogleMap {...props} />;
};

export default MapProvider;
