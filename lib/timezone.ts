import { format, parseISO } from "date-fns";

// Central Timezone is UTC-6 (CST) or UTC-5 (CDT)
// We need to handle this properly for both display and storage

/**
 * Get the current Central Time offset in milliseconds
 * Central Time is UTC-6 (standard) or UTC-5 (DST)
 */
function getCentralOffsetMs(): number {
  // Create a date in Central timezone to get the actual offset
  const now = new Date();
  const centralTimeStr = now.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  
  // Parse the central time string
  const [datePart, timePart] = centralTimeStr.split(", ");
  const [month, day, year] = datePart.split("/");
  const [hour, minute, second] = timePart.split(":");
  
  const centralDate = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
    parseInt(second)
  );
  
  // The offset is the difference between local (which is UTC in the DB) and Central
  return now.getTime() - centralDate.getTime();
}

/**
 * Format a date to Central timezone string for display
 * Input is UTC from database, output is Central time string
 */
export function formatInCentral(date: Date | string, formatStr: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  // Get offset between UTC and Central for this specific date
  const utcDate = new Date(d.getTime());
  const centralOffsetMs = getOffsetToCentral(utcDate);
  
  // Adjust UTC to Central
  const centralDate = new Date(utcDate.getTime() - centralOffsetMs);
  
  return format(centralDate, formatStr);
}

/**
 * Calculate offset from UTC to Central Time in milliseconds
 */
function getOffsetToCentral(utcDate: Date): number {
  // Create a string representation of the UTC date in Central timezone
  const centralStr = utcDate.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  
  const [datePart, timePart] = centralStr.split(", ");
  const [month, day, year] = datePart.split("/");
  const [hour, minute, second] = timePart.split(":");
  
  const centralDate = Date.UTC(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
    parseInt(second)
  );
  
  return utcDate.getTime() - centralDate;
}

/**
 * Format date for display (e.g., "Monday, January 15, 2024")
 */
export function formatDate(date: Date | string): string {
  return formatInCentral(date, "EEEE, MMMM d, yyyy");
}

/**
 * Format time for display (e.g., "3:00 PM")
 */
export function formatTime(date: Date | string): string {
  return formatInCentral(date, "h:mm a");
}

/**
 * Format date and time (e.g., "Mon, Jan 15 at 3:00 PM")
 */
export function formatDateTime(date: Date | string): string {
  return formatInCentral(date, "EEE, MMM d 'at' h:mm a");
}

/**
 * Convert a Central time input to UTC for database storage
 * User inputs time in Central, we store as UTC
 */
export function centralToUTC(centralDate: Date): Date {
  const offsetMs = getOffsetToCentral(centralDate);
  return new Date(centralDate.getTime() + offsetMs);
}
