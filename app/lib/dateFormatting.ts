import { format } from "date-fns";

/**
 * Date formatting utilities using date-fns wrappers
 */

/**
 * Format date for display
 * @param date Date to format
 * @returns Formatted date string (e.g., "Feb 05, 2026")
 */
export function formatDate(date: Date): string {
  return format(date, "MMM dd, yyyy");
}

/**
 * Format completion date for display
 * @param date Completion date
 * @returns Formatted date string (e.g., "Feb 05, 2026")
 */
export function formatCompletedDate(date: Date): string {
  return format(date, "MMM dd, yyyy");
}

/**
 * Format days remaining for display
 * @param days Number of days remaining
 * @returns Display string (e.g., "5 days left" or "1 day left")
 */
export function daysRemainingDisplay(days: number): string {
  if (days === 1) return "1 day left";
  if (days === 0) return "0 days left";
  if (days < 0) return "Expired";
  return `${days} days left`;
}
