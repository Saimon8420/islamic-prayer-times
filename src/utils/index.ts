import { format } from 'date-fns';

// Parse time string (HH:mm) to Date object
export const parseTime = (timeStr: string | undefined, baseDate: Date = new Date()): Date => {
  if (!timeStr) return new Date(baseDate);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
};

// Format time for display
export const formatTime = (time: Date | string | undefined, use24Hour: boolean = false): string => {
  if (!time) return '--:--';
  try {
    const date = typeof time === 'string' ? parseTime(time) : time;
    return format(date, use24Hour ? 'HH:mm' : 'h:mm a');
  } catch {
    return '--:--';
  }
};

// Format seconds to human-readable countdown
export const formatCountdown = (seconds: number): string => {
  if (!seconds || seconds < 0) return '0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

// Format duration in minutes to human readable
export const formatDuration = (minutes: number): string => {
  if (!minutes) return '--';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Convert degrees to cardinal direction
export const degreesToCardinal = (degrees: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

// Format distance in km
export const formatDistance = (km: number | undefined): string => {
  if (!km) return '--';
  if (km >= 1000) {
    return `${(km / 1000).toFixed(0)}k km`;
  }
  return `${km.toFixed(0)} km`;
};

// Get current date in formatted string
export const getCurrentDateString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

// Get current month in formatted string
export const getCurrentMonthString = (): string => {
  return format(new Date(), 'yyyy-MM');
};

// Get greeting based on time of day
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
};

// Get Islamic greeting
export const getIslamicGreeting = (): { en: string; ar: string } => {
  return {
    en: 'Assalamu Alaikum',
    ar: 'السلام عليكم',
  };
};
