import { toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Converts a local date and time to a UTC ISO string
 *
 * @param localDate - The date in the user's local timezone
 * @param localTime - Time as decimal hours (e.g., 14.5 for 2:30 PM)
 * @param timezone - IANA timezone (e.g., "America/New_York")
 * @returns ISO string in UTC (e.g., "2024-01-04T19:30:00.000Z")
 *
 * @example
 * // User in EST creates block at 2:30 PM on Jan 4
 * localToUTC(new Date(2024, 0, 4), 14.5, "America/New_York")
 * // Returns: "2024-01-04T19:30:00.000Z" (UTC)
 */
export function localToUTC(
  localDate: Date,
  localTime: number,
  timezone: string
): string {
  // Extract hours and minutes from decimal time
  const hours = Math.floor(localTime);
  const minutes = Math.round((localTime % 1) * 60);

  // Create a date object with the local date and time components
  // We use the year, month, day from localDate and set the time
  const dateWithTime = new Date(
    localDate.getFullYear(),
    localDate.getMonth(),
    localDate.getDate(),
    hours,
    minutes,
    0,
    0
  );

  // Convert from the specified timezone to UTC
  // fromZonedTime treats the input as being in the given timezone
  const utcDate = fromZonedTime(dateWithTime, timezone);

  return utcDate.toISOString();
}

/**
 * Converts a UTC ISO string to local date/time components
 *
 * @param utcISOString - ISO string in UTC (e.g., "2024-01-04T19:30:00.000Z")
 * @param timezone - IANA timezone (e.g., "America/New_York")
 * @returns Object with local date and time components
 *
 * @example
 * // UTC block at 19:30 displayed in EST
 * utcToLocal("2024-01-04T19:30:00.000Z", "America/New_York")
 * // Returns: { date: Date(2024-01-04), hours: 14, minutes: 30, timeDecimal: 14.5 }
 */
export function utcToLocal(
  utcISOString: string,
  timezone: string
): {
  date: Date;
  hours: number;
  minutes: number;
  timeDecimal: number;
} {
  // Parse the UTC ISO string
  const utcDate = new Date(utcISOString);

  // Convert to the specified timezone
  const zonedDate = toZonedTime(utcDate, timezone);

  // Extract components
  const hours = zonedDate.getHours();
  const minutes = zonedDate.getMinutes();
  const timeDecimal = hours + minutes / 60;

  // Create a date object with just the date part (no time)
  const date = new Date(
    zonedDate.getFullYear(),
    zonedDate.getMonth(),
    zonedDate.getDate()
  );

  return {
    date,
    hours,
    minutes,
    timeDecimal,
  };
}

/**
 * Gets the user's system timezone
 *
 * @returns IANA timezone string (e.g., "America/New_York")
 */
export function getSystemTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function createLocalTimeISO(date: Date, hours: number, minutes: number, timezone: string): string;
export function createLocalTimeISO(dateTime: Date, timezone: string): string;

/**
 * Create UTC ISO string from local date and time values with proper timezone conversion
 * This converts local time values to UTC using the specified timezone.
 *
 * @param date - The date (only the date part is used)
 * @param hours - Hour value (0-23)
 * @param minutes - Minute value (0-59)
 * @param timezone - IANA timezone (e.g., "America/New_York")
 * @returns ISO 8601 string in UTC format: YYYY-MM-DDTHH:MM:SS.000Z
 *
 * @example
 * const date = new Date('2024-01-04');
 * // User in EST creates block at 2:30 PM
 * createLocalTimeISO(date, 14, 30, "America/New_York")
 * // Returns "2024-01-04T19:30:00.000Z" (UTC)
 */
export function createLocalTimeISO(
  dateOrDateTime: Date,
  hoursOrTimezone: number | string,
  minutes?: number,
  timezone?: string
): string {
  if (typeof hoursOrTimezone === 'number' && minutes !== undefined && timezone) {
    // Four-parameter version: date, hours, minutes, timezone
    const timeDecimal = hoursOrTimezone + minutes / 60;
    return localToUTC(dateOrDateTime, timeDecimal, timezone);
  } else if (typeof hoursOrTimezone === 'string') {
    // Two-parameter version: dateTime, timezone
    const hours = dateOrDateTime.getHours();
    const mins = dateOrDateTime.getMinutes();
    const timeDecimal = hours + mins / 60;
    return localToUTC(dateOrDateTime, timeDecimal, hoursOrTimezone);
  } else {
    throw new Error(
      'createLocalTimeISO requires timezone parameter. Use either (date, hours, minutes, timezone) or (dateTime, timezone)'
    );
  }
}

/**
 * Parse UTC ISO string and convert to local timezone
 * This properly converts UTC timestamps to the user's local timezone.
 *
 * @param isoString - ISO 8601 string in UTC (e.g., "2024-01-04T19:30:00.000Z")
 * @param timezone - IANA timezone (e.g., "America/New_York")
 * @returns Object with date, hours, and minutes as local values in the specified timezone
 *
 * @example
 * // UTC block at 19:30 displayed in EST
 * parseLocalTimeISO("2024-01-04T19:30:00.000Z", "America/New_York")
 * // Returns: { date: Date(2024, 0, 4), hours: 14, minutes: 30, timeDecimal: 14.5 }
 */
export function parseLocalTimeISO(
  isoString: string,
  timezone: string
): {
  date: Date;
  hours: number;
  minutes: number;
  timeDecimal: number;
} {
  return utcToLocal(isoString, timezone);
}
