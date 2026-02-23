import { format } from "date-fns";

// Central timezone offset in hours (America/Chicago is UTC-6 or UTC-5 depending on DST)
// For simplicity, directly adjusting by the offset
function getCentralOffset(): number {
  const now = new Date();
  const january = new Date(now.getFullYear(), 0, 1);
  const july = new Date(now.getFullYear(), 6, 1);
  const stdOffset = january.getTimezoneOffset();
  const dstOffset = july.getTimezoneOffset();
  
  // Use a fixed approach: Central Time is UTC-6 (standard) or UTC-5 (DST)
  // For now, use -6 hours (standard) - this will be roughly correct
  const d = typeof now === 'string' ? new Date(now) : now;
  if (d.getTimezoneOffset() === stdOffset) {
    return -6; // CST
  }
  return -5; // CDT
}

/**
 * Convert UTC time to Central Time
 * The database stores times in UTC, we need to display in Central
 */
function toCentralTime(utcDate: Date): Date {
  const offset = getCentralOffset();
  return new Date(utcDate.getTime() + offset * 60 * 60 * 1000);
}

/**
 * Format a date to Central timezone string
 */
export function formatInCentral(date: Date | string, formatStr: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  // Times from DB are UTC, convert to Central
  const centralDate = toCentralTime(d);
  return format(centralDate, formatStr);
}

/**
 * Format date for display (e.g., "Monday, January 15, 2024")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  // Date is stored at midnight UTC, convert to Central for correct date display
  return formatInCentral(d, "EEEE, MMMM d, yyyy");
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
 * Convert a local time input (from user in Central time) to UTC for database storage
 */
export function localToUTC(localDate: Date): Date {
  const offset = getCentralOffset();
  return new Date(localDate.getTime() - offset * 60 * 60 * 1000);
}
