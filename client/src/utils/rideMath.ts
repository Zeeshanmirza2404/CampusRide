// Haversine formula to calculate distance between two points on Earth
export const calculateDistance = (
  lat1: number | undefined | null,
  lng1: number | undefined | null,
  lat2: number | undefined | null,
  lng2: number | undefined | null
): number => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return 0;

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return parseFloat(d.toFixed(2));
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const calculateFare = (
  distanceKm: number | undefined | null,
  ratePerKm: number | undefined | null
): number => {
  if (!distanceKm || !ratePerKm) return 0;
  return parseFloat((distanceKm * ratePerKm).toFixed(2));
};
