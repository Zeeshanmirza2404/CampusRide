
import React from 'react';
import { MAP_PROVIDER } from './mapConfig';
import LeafletMap from './LeafletMap';
import GoogleMap from './GoogleMap';

const MapProvider = (props) => {
  if (MAP_PROVIDER === 'leaflet') {
    return <LeafletMap {...props} />;
  }
  return <GoogleMap {...props} />;
};

export default MapProvider;
