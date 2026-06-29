
/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

/**
 * Get the current date/time (always fresh)
 */
export const getToday = (): Date => {
  return new Date();
};

/**
 * Calculate the Monday of the week for a given date
 * @param date - The date to find the Monday for
 * @returns The Monday of the week containing the given date
 */
export const getMondayOfWeek = (date: Date): Date => {
  const dayOfWeek = date.getDay();
  // Calculate days to subtract to get to Monday (0 = Sunday, 1 = Monday, etc.)
  // If Sunday (0), subtract 6 days to get to Monday
  // Otherwise, subtract (dayOfWeek - 1) days
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0); // Normalize to midnight for consistent comparisons
  return monday;
};

/**
 * Get the initial Monday date for calendar state (Monday of current week)
 * @returns The Monday of the current week
 */
export const getInitialMondayDate = (): Date => {
  const today = getToday();
  return getMondayOfWeek(today);
};

/**
 * Get array of dates to display based on view mode
 * @param currentDate - The current date being viewed
 * @param viewMode - Either 'week' or 'day' view mode
 * @returns Array of dates to display (1 date for day view, 7 dates for week view)
 */
export const getWeekDates = (
  currentDate: Date,
  viewMode: 'week' | 'day'
): Date[] => {
  // If in day view, return just the current date
  if (viewMode === 'day') {
    return [new Date(currentDate)];
  }

  // If in week view, get the Monday of the week and return all 7 days
  const monday = getMondayOfWeek(currentDate);
  const dates: Date[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }

  return dates;
};

/**
 * Format the date range string for the calendar header
 * @param currentDate - The current date being viewed
 * @param viewMode - Either 'week' or 'day' view mode
 * @returns Formatted date range string (e.g., "Monday, Jan 15" or "Jan 15 - 21")
 */
export const formatDateRange = (
  currentDate: Date,
  viewMode: 'week' | 'day'
): string => {
  if (viewMode === 'day') {
    const date = new Date(currentDate);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    return `${weekday}, ${month} ${day}`;
  }

  // Week view: format date range
  const dates = getWeekDates(currentDate, viewMode);
  const start = dates[0];
  const end = dates[6];
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endDay = end.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
};

/**
 * Check if a date is today
 * @param date - The date to check
 * @returns True if the date is today, false otherwise
 */
export const isToday = (date: Date): boolean => {
  const today = getToday();
  return isSameDay(date, today);
};

/**
 * Check if the current view includes today
 * @param currentDate - The current date being viewed
 * @param viewMode - Either 'week' or 'day' view mode
 * @param datesToShow - Array of dates currently displayed
 * @returns True if today is in the current view, false otherwise
 */
export const isViewingToday = (
  currentDate: Date,
  viewMode: 'week' | 'day',
  datesToShow: Date[]
): boolean => {
  if (viewMode === 'day') {
    return isToday(currentDate);
  }
  // In week view, check if today is in the dates array
  return datesToShow.some((date) => isToday(date));
};

/**
 * Get the appropriate date for "today" based on view mode
 * For week view, returns Monday of current week
 * For day view, returns today's date
 * @param viewMode - Either 'week' or 'day' view mode
 * @returns The date to navigate to for "today"
 */
export const getTodayDateForView = (viewMode: 'week' | 'day'): Date => {
  const today = getToday();
  if (viewMode === 'day') {
    return today;
  }
  // In week view, return Monday of the week containing today
  return getMondayOfWeek(today);
};

/**
 * Format time from hour number (0-23.75) to "9:00 AM" or "12:30 PM" format
 * Supports fractional hours (0.25 = 15 min, 0.5 = 30 min, 0.75 = 45 min)
 * @param hour - Hour number (0-23.75) with optional fractional part
 * @returns Formatted time string (e.g., "9:00 AM", "12:30 PM")
 */
export const formatTime = (hour: number): string => {
  // Extract integer hour and fractional part
  const hourInt = Math.floor(hour);
  const fractionalPart = hour % 1;
  
  // Convert fractional part to minutes (0, 15, 30, or 45)
  const minutes = Math.round(fractionalPart * 60);
  const minutesStr = minutes.toString().padStart(2, '0');
  
  // Handle AM/PM conversion
  if (hourInt === 0) {
    return `12:${minutesStr} AM`;
  }
  if (hourInt < 12) {
    return `${hourInt}:${minutesStr} AM`;
  }
  if (hourInt === 12) {
    return `12:${minutesStr} PM`;
  }
  return `${hourInt - 12}:${minutesStr} PM`;
};

/**
 * Format elapsed time from seconds to "MM:SS" format
 * @param seconds - Total seconds elapsed
 * @returns Formatted time string (e.g., "05:30" for 5 minutes 30 seconds)
 */
export const formatElapsedTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format date as YYYY-MM-DD string
 * @param date - The date to format
 * @returns Formatted date string (e.g., "2025-01-15")
 */
export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get the number of days in a month
 * @param year - The year
 * @param monthIndex - The month index (0-11 for Jan-Dec)
 * @returns Number of days in the month
 */
export const getDaysInMonth = (year: number, monthIndex: number): number => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

/**
 * Get the day of the week for the first day of a month
 * @param year - The year
 * @param monthIndex - The month index (0-11 for Jan-Dec)
 * @returns Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
 */
export const getFirstDayOfMonth = (year: number, monthIndex: number): number => {
  return new Date(year, monthIndex, 1).getDay();
};

/**
 * Convert Sunday-based day of week to Monday-based
 * @param sundayBasedDay - Day of week where 0=Sunday, 1=Monday, etc.
 * @returns Monday-based day where 0=Monday, 1=Tuesday, ..., 6=Sunday
 */
export const toMondayBasedDay = (sundayBasedDay: number): number => {
  // Convert: Sunday (0) -> 6, Monday (1) -> 0, Tuesday (2) -> 1, etc.
  return sundayBasedDay === 0 ? 6 : sundayBasedDay - 1;
};

/**
 * Calculate the number of weeks needed to display a month in a calendar grid
 * @param year - The year
 * @param monthIndex - The month index (0-11 for Jan-Dec)
 * @returns Number of weeks needed (typically 4-6 weeks)
 */
export const getWeeksInMonth = (year: number, monthIndex: number): number => {
  const firstDay = getFirstDayOfMonth(year, monthIndex);
  const mondayBasedFirstDay = toMondayBasedDay(firstDay);
  const daysInMonth = getDaysInMonth(year, monthIndex);
  return Math.ceil((mondayBasedFirstDay + daysInMonth) / 7);
};

/**
 * Format duration from start and end ISO date strings
 * @param startTime - ISO date string for start time
 * @param endTime - ISO date string for end time
 * @returns Formatted duration string (e.g., "2h 15m", "1h", "30m")
 */
export function formatDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Format time range from start and end ISO date strings
 * @param startTime - ISO date string for start time
 * @param endTime - ISO date string for end time
 * @returns Formatted time range string (e.g., "14:00 - 16:15")
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return `${formatTime(start)} - ${formatTime(end)}`;
}


/**
 * Parse duration string (e.g., "2h 15m" or "1h" or "30m") to total minutes
 * @param duration - Duration string in format "Xh Ym", "Xh", or "Ym"
 * @returns Total minutes as a number
 */
export function parseDurationToMinutes(duration: string): number {
  const hourMatch = duration.match(/(\d+)h/);
  const minuteMatch = duration.match(/(\d+)m/);

  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

  return hours * 60 + minutes;
}

/**
 * Format date as "Month Day" (e.g., "Jan 15")
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDateShort(date: Date): string {
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

/**
 * Format time in local timezone (12-hour format)
 * @param date - The date to format
 * @returns Formatted time string (e.g., "9:00 AM", "12:30 PM")
 */
export function formatLocalTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  const minuteStr = minutes.toString().padStart(2, '0');
  return `${hour12}:${minuteStr} ${ampm}`;
}

/**
 * Format minutes to "Xh Ym" or "Ym" format
 * @param minutes - Total minutes
 * @returns Formatted time string (e.g., "2h 15m", "1h", "30m")
 */
export function formatMinutes(minutes: number): string {
  if (minutes === 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Format full date with ordinal suffix (e.g., "Monday, January 15th, 2025")
 * @param date - The date to format
 * @returns Formatted date string with ordinal suffix
 */
export function formatFullDate(date: Date): string {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const day = date.getDate();
  const year = date.getFullYear();
  
  // Add ordinal suffix
  const getOrdinalSuffix = (n: number): string => {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  return `${weekday}, ${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
}

/**
 * Format week date range for Weekly Goals header
 * Format: "Jan 8 – 14, 2024"
 * @param weekStart - The Monday date of the week
 * @returns Formatted date range string
 */
export function formatWeekRangeForGoals(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();
  const year = weekStart.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
}

/**
 * Format week title for calendar header
 * Format: "Week of Jan 12 - 18, 2026"
 * @param currentDate - The current date being viewed
 * @returns Formatted week title string
 */
export function formatWeekTitle(currentDate: Date): string {
  const weekDates = getWeekDates(currentDate, 'week');
  const monday = weekDates[0];
  const sunday = weekDates[6];
  const startMonth = monday.toLocaleDateString('en-US', { month: 'short' });
  const startDay = monday.getDate();
  const endMonth = sunday.toLocaleDateString('en-US', { month: 'short' });
  const endDay = sunday.getDate();
  const year = monday.getFullYear();
  
  if (startMonth === endMonth) {
    return `Week of ${startMonth} ${startDay} - ${endDay}, ${year}`;
  }
  return `Week of ${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}
