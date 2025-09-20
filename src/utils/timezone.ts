// Timezone utility functions for UTC storage and local display

/**
 * Get user's current timezone
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Get timezone offset in hours (for display purposes)
 */
export const getTimezoneOffset = (timezone?: string): number => {
  const tz = timezone || getUserTimezone();
  const date = new Date();
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const localDate = new Date(date.toLocaleString("en-US", { timeZone: tz }));
  
  return (localDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
};

/**
 * Convert local datetime to UTC for storage
 * @param localDate - Date string in YYYY-MM-DD format
 * @param localTime - Time string in HH:MM format
 * @param userTimezone - User's timezone (optional, auto-detected if not provided)
 * @returns Object with UTC date and time strings
 */
export const convertToUTC = (
  localDate: string, 
  localTime: string, 
  userTimezone?: string
): { utcDate: string; utcTime: string; utcDateTime: string } => {
  const tz = userTimezone || getUserTimezone();
  
  // Create a date object in user's timezone
  const localDateTime = new Date(`${localDate}T${localTime}:00`);
  
  // Convert to UTC by adjusting for timezone
  const utcDateTime = new Date(localDateTime.toLocaleString("en-US", { timeZone: "UTC" }));
  
  // If the local interpretation was wrong, we need to adjust
  const localAsUTC = new Date(`${localDate}T${localTime}:00`);
  const offset = getTimezoneOffset(tz);
  const correctUTC = new Date(localAsUTC.getTime() - (offset * 60 * 60 * 1000));
  
  const utcDate = correctUTC.toISOString().split('T')[0];
  const utcTime = correctUTC.toTimeString().split(' ')[0].substring(0, 5);
  const utcDateTimeStr = correctUTC.toISOString();
  
  return {
    utcDate,
    utcTime,
    utcDateTime: utcDateTimeStr
  };
};

/**
 * Convert UTC datetime to user's local timezone for display
 * @param utcDate - UTC date string in YYYY-MM-DD format
 * @param utcTime - UTC time string in HH:MM format
 * @param userTimezone - User's timezone (optional, auto-detected if not provided)
 * @returns Object with local date and time strings
 */
export const convertFromUTC = (
  utcDate: string, 
  utcTime: string, 
  userTimezone?: string
): { localDate: string; localTime: string; localDateTime: Date } => {
  const tz = userTimezone || getUserTimezone();
  
  // Create UTC datetime
  const utcDateTime = new Date(`${utcDate}T${utcTime}:00.000Z`);
  
  // Convert to user's timezone
  const localDateTime = new Date(utcDateTime.toLocaleString("en-US", { timeZone: tz }));
  
  // Get local date and time strings
  const localDate = utcDateTime.toLocaleDateString('en-CA', { timeZone: tz }); // YYYY-MM-DD format
  const localTime = utcDateTime.toLocaleTimeString('en-GB', { 
    timeZone: tz, 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return {
    localDate,
    localTime,
    localDateTime: new Date(utcDateTime.toLocaleString("en-US", { timeZone: tz }))
  };
};

/**
 * Convert stored UTC datetime string to local display
 * @param utcDateTime - UTC datetime string (ISO format)
 * @param userTimezone - User's timezone (optional)
 */
export const utcToLocal = (
  utcDateTime: string, 
  userTimezone?: string
): { localDate: string; localTime: string; localDateTime: Date } => {
  const utcDate = new Date(utcDateTime);
  const tz = userTimezone || getUserTimezone();
  
  const localDate = utcDate.toLocaleDateString('en-CA', { timeZone: tz });
  const localTime = utcDate.toLocaleTimeString('en-GB', { 
    timeZone: tz, 
    hour12: false,
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return {
    localDate,
    localTime,
    localDateTime: new Date(utcDate.toLocaleString("en-US", { timeZone: tz }))
  };
};

/**
 * Get formatted timezone display name
 */
export const getTimezoneDisplayName = (timezone?: string): string => {
  const tz = timezone || getUserTimezone();
  const offset = getTimezoneOffset(tz);
  const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
  
  // Get city name from timezone
  const cityName = tz.split('/').pop()?.replace('_', ' ') || tz;
  
  return `${cityName} (UTC${offsetStr})`;
};

/**
 * Check if a UTC datetime is today in user's timezone
 */
export const isToday = (utcDate: string, utcTime: string, userTimezone?: string): boolean => {
  const { localDate } = convertFromUTC(utcDate, utcTime, userTimezone);
  const today = new Date().toLocaleDateString('en-CA');
  return localDate === today;
};

/**
 * Check if a UTC datetime is in the past
 */
export const isPast = (utcDate: string, utcTime: string, userTimezone?: string): boolean => {
  const utcDateTime = new Date(`${utcDate}T${utcTime}:00.000Z`);
  return utcDateTime < new Date();
};

/**
 * Format datetime for display with timezone info
 */
export const formatDisplayDateTime = (
  utcDate: string, 
  utcTime: string, 
  userTimezone?: string,
  options?: {
    showDate?: boolean;
    showTime?: boolean;
    showTimezone?: boolean;
    format12Hour?: boolean;
  }
): string => {
  const { showDate = true, showTime = true, showTimezone = false, format12Hour = false } = options || {};
  const { localDate, localTime } = convertFromUTC(utcDate, utcTime, userTimezone);
  
  let result = '';
  
  if (showDate) {
    const date = new Date(localDate);
    result += date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  if (showTime) {
    if (showDate) result += ' at ';
    
    if (format12Hour) {
      const [hours, minutes] = localTime.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      result += `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } else {
      result += localTime;
    }
  }
  
  if (showTimezone) {
    const tzName = getTimezoneDisplayName(userTimezone);
    result += ` (${tzName})`;
  }
  
  return result;
};

/**
 * Get current date and time in user's timezone for form defaults
 */
export const getCurrentLocalDateTime = (userTimezone?: string): { date: string; time: string } => {
  const tz = userTimezone || getUserTimezone();
  const now = new Date();
  
  const date = now.toLocaleDateString('en-CA', { timeZone: tz });
  const time = now.toLocaleTimeString('en-GB', { 
    timeZone: tz, 
    hour12: false,
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return { date, time };
};

/**
 * Validate timezone
 */
export const isValidTimezone = (timezone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};

/**
 * Get common timezones for selection
 */
export const getCommonTimezones = () => [
  { value: 'Africa/Cairo', label: 'Cairo (UTC+2)' },
  { value: 'Asia/Riyadh', label: 'Riyadh (UTC+3)' },
  { value: 'Asia/Dubai', label: 'Dubai (UTC+4)' },
  { value: 'Asia/Kuwait', label: 'Kuwait (UTC+3)' },
  { value: 'Asia/Baghdad', label: 'Baghdad (UTC+3)' },
  { value: 'Europe/London', label: 'London (UTC+0/+1)' },
  { value: 'Europe/Paris', label: 'Paris (UTC+1/+2)' },
  { value: 'America/New_York', label: 'New York (UTC-5/-4)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-8/-7)' },
  { value: 'America/Chicago', label: 'Chicago (UTC-6/-5)' },
  { value: 'Australia/Sydney', label: 'Sydney (UTC+10/+11)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' },
  { value: 'Asia/Singapore', label: 'Singapore (UTC+8)' },
];

// Example usage and testing
export const testTimezoneConversion = () => {
  console.log('=== Timezone Conversion Test ===');
  
  // Test case: Class scheduled for 6 PM Cairo time on Sept 14, 2025
  const localDate = '2025-09-14';
  const localTime = '18:00';
  const cairoTz = 'Africa/Cairo';
  
  console.log(`Original: ${localDate} ${localTime} in ${cairoTz}`);
  
  // Convert to UTC for storage
  const { utcDate, utcTime } = convertToUTC(localDate, localTime, cairoTz);
  console.log(`Stored in DB (UTC): ${utcDate} ${utcTime}`);
  
  // Convert back to different timezones for display
  const timezones = [
    { tz: 'Africa/Cairo', name: 'Cairo' },
    { tz: 'Asia/Riyadh', name: 'Riyadh' },
    { tz: 'America/New_York', name: 'New York' },
  ];
  
  timezones.forEach(({ tz, name }) => {
    const { localDate: displayDate, localTime: displayTime } = convertFromUTC(utcDate, utcTime, tz);
    console.log(`${name}: ${displayDate} ${displayTime}`);
  });
};