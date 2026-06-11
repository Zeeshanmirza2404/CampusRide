import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Custom Icons Definitions ---
const driverIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/5066/5066826.png', // Arrow/Car icon
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

const riderIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // People icon
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const destinationIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Pindrop icon
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

interface Coords {
  lat: number;
  lng: number;
}

interface RecenterMapProps {
  center?: Coords | null;
}

// Component to handle map view updates
const RecenterMap: React.FC<RecenterMapProps> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);
  return null;
};

interface LeafletMapProps {
  center?: Coords;
  driverLocation?: Coords | null;
  riderLocation?: Coords | null;
  pickupCoords?: Coords | null;
  dropCoords?: Coords | null;
  rideStatus?: string | null;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ 
  center, 
  driverLocation, 
  riderLocation, 
  pickupCoords, 
  dropCoords, 
  rideStatus 
}) => {
  const [routeData, setRouteData] = useState<[number, number][]>([]);
  const ORS_API_KEY = import.meta.env.VITE_OPENROUTE_API_KEY;

  // Validate coordinates
  const isValid = (c: any): c is Coords => c && typeof c.lat === 'number' && typeof c.lng === 'number';

  // Fetch Route from OpenRouteService
  useEffect(() => {
    const fetchRoute = async () => {
      if (!ORS_API_KEY || !driverLocation) return;

      let target: Coords | null = null;
      if (rideStatus === "accepted") target = pickupCoords ?? null;
      else if (rideStatus === "ongoing") target = dropCoords ?? null;

      if (!isValid(target)) return;

      try {
        const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${driverLocation.lng},${driverLocation.lat}&end=${target.lng},${target.lat}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const coords = data.features[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
          setRouteData(coords);
        } else {
          // Fallback to straight line if ORS fails
          setRouteData([[driverLocation.lat, driverLocation.lng], [target.lat, target.lng]]);
        }
      } catch (error) {
        console.error("Routing error:", error);
        setRouteData([[driverLocation.lat, driverLocation.lng], [target.lat, target.lng]]);
      }
    };

    fetchRoute();
  }, [driverLocation, pickupCoords, dropCoords, rideStatus, ORS_API_KEY]);

  const defaultCenter = isValid(center) ? center : (isValid(driverLocation) ? driverLocation : { lat: 19.830082, lng: 79.385354 });

  return (
    <MapContainer 
      center={[defaultCenter.lat, defaultCenter.lng]} 
      zoom={15} 
      zoomControl={false} // Disable default top-left controls
      style={{ height: '100%', width: '100%', borderRadius: '15px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <ZoomControl position="bottomright" />
      
      <RecenterMap center={driverLocation || riderLocation} />

      {/* Driver Marker */}
      {isValid(driverLocation) && (
        <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
          <Popup>Driver (Live)</Popup>
        </Marker>
      )}

      {/* Pickup Marker (Always visible for context) */}
      {isValid(pickupCoords) && (
        <Marker position={[pickupCoords.lat, pickupCoords.lng]} icon={riderIcon}>
          <Popup>Pickup Point</Popup>
        </Marker>
      )}

      {/* Destination Marker (Always visible for context) */}
      {isValid(dropCoords) && (
        <Marker position={[dropCoords.lat, dropCoords.lng]} icon={destinationIcon}>
          <Popup>Destination</Popup>
        </Marker>
      )}

      {/* Rider's own position (Local Only) */}
      {isValid(riderLocation) && (
        <Marker position={[riderLocation.lat, riderLocation.lng]}>
          <Popup>Your Location</Popup>
        </Marker>
      )}

      {/* Route Line */}
      {routeData.length > 0 && (
        <Polyline 
          positions={routeData}
          pathOptions={{ 
            color: '#3b82f6', 
            weight: 5, 
            opacity: 0.7,
            dashArray: '1, 10' // Dashed line for modern look
          }} 
        />
      )}
    </MapContainer>
  );
};

export default LeafletMap;
