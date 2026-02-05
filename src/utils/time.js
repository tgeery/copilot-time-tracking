// Get today's date in YYYY-MM-DD format
export const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Get current time as { hour, minute }
export const getCurrentTime = () => {
  const now = new Date();
  return {
    hour: now.getHours(),
    minute: now.getMinutes(),
  };
};

// Format duration in minutes to "XhYmZs" format
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  return `${hours}h ${mins}m`;
};

// Format duration in minutes to "HH:MM:SS" format
export const formatElapsedTime = (minutes) => {
  const totalSeconds = minutes * 60;
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Calculate elapsed minutes from start time to now
export const calculateElapsedMinutes = (startTime) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startTime.hour * 60 + startTime.minute;
  return Math.max(0, currentMinutes - startMinutes);
};
