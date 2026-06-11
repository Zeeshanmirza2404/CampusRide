export const isRidePast = (dateStr: string | undefined | null, timeStr: string | undefined | null): boolean => {
  if (!dateStr || !timeStr) return false;

  const now = new Date();
  const rideDate = new Date(dateStr);
  
  // Parse 12-hour time (e.g., "02:30 PM")
  const [time, modifier] = timeStr.split(' ');
  let [hoursStr, minutesStr] = time.split(':');
  
  let hours = parseInt(hoursStr, 10);
  let minutes = parseInt(minutesStr, 10);

  if (hours === 12) {
    hours = 0;
  }
  
  if (modifier === 'PM') {
    hours += 12;
  }
  
  rideDate.setHours(hours, minutes, 0, 0);
  
  return rideDate < now;
};
