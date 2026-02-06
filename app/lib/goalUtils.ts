import { differenceInDays, startOfDay } from "date-fns";
import type { Goal, GoalStatus } from "./types";

/**
 * Business logic utilities for goal management
 */

/**
 * Calculate days remaining until goal end date
 * @param endDate Target completion date
 * @returns Number of days remaining (negative if expired)
 */
export function daysRemaining(endDate: Date): number {
  const today = startOfDay(new Date());
  const end = startOfDay(endDate);
  return differenceInDays(end, today);
}

/**
 * Check if goal is expired (past its end date)
 * @param endDate Target completion date
 * @returns true if goal is expired
 */
export function isExpired(endDate: Date): boolean {
  return daysRemaining(endDate) < 0;
}

/**
 * Check if goal ends today
 * @param endDate Target completion date
 * @returns true if end date is today
 */
export function isToday(endDate: Date): boolean {
  return daysRemaining(endDate) === 0;
}

/**
 * Get visual status based on days remaining
 * @param endDate Target completion date
 * @returns GoalStatus: "active" (>3 days), "warning" (3-1 days), or "critical" (≤0 days)
 */
export function getVisualStatus(endDate: Date): GoalStatus {
  const days = daysRemaining(endDate);
  if (days <= 0) return "critical";
  if (days <= 3) return "warning";
  return "active";
}

/**
 * Sort active goals by days remaining, then by creation date
 * @param goals Array of goals to sort
 * @returns Sorted goals (earliest deadline first, then oldest creation first)
 */
export function sortActiveGoals(goals: Goal[]): Goal[] {
  return [...goals].sort((a, b) => {
    const aDays = daysRemaining(a.endDate);
    const bDays = daysRemaining(b.endDate);
    if (aDays !== bDays) return aDays - bDays;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

/**
 * Sort completed goals by completion date (newest first)
 * @param goals Array of goals to sort
 * @returns Sorted goals (most recently completed first)
 */
export function sortCompletedGoals(goals: Goal[]): Goal[] {
  return [...goals].sort((a, b) => {
    const aTime = a.completedAt?.getTime() || 0;
    const bTime = b.completedAt?.getTime() || 0;
    return bTime - aTime; // Descending (newest first)
  });
}

/**
 * Validate goal inputs
 * @param title Goal title
 * @param endDate Goal end date
 * @returns Error message if invalid, null if valid
 */
export function validateGoal(title: string, endDate: Date): string | null {
  // Validate title
  if (!title || !title.trim()) {
    return "Goal title is required";
  }

  if (title.trim().length > 200) {
    return "Goal title must be 200 characters or less";
  }

  // Validate end date
  const today = startOfDay(new Date());
  const selectedDay = startOfDay(endDate);

  if (selectedDay < today) {
    return "End date must be in the future or today";
  }

  return null;
}
