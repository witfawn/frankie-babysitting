import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

// Central timezone for all displays
const TIMEZONE = "America/Chicago";

/**
 * Format a date to Central timezone string
 */
export function formatInCentral(date: Date | string, formatStr: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const zonedDate = toZonedTime(d, TIMEZONE);
  return format(zonedDate, formatStr);
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
