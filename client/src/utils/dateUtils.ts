export const isRidePast = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return false;

  const now = new Date();
  const rideDate = new Date(dateStr);
  
  // Parse 12-hour time (e.g., "02:30 PM")
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') {
    hours = '00';
  }
  
  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }
  
  rideDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  
  return rideDate < now;
};
