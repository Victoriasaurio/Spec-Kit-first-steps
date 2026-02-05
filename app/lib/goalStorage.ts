import type { Goal } from "./types";

/**
 * localStorage operations for goal persistence
 */

const ACTIVE_GOALS_KEY = "doit_goals";
const COMPLETED_GOALS_KEY = "doit_completed";

/**
 * Load active goals from localStorage
 * @returns Array of active goals, empty array if not found or parse fails
 */
export function loadActiveGoals(): Goal[] {
  try {
    const stored = localStorage.getItem(ACTIVE_GOALS_KEY);
    if (!stored) return [];
    const goals = JSON.parse(stored) as Goal[];
    // Convert date strings back to Date objects
    return goals.map((goal) => ({
      ...goal,
      endDate: new Date(goal.endDate),
      createdAt: new Date(goal.createdAt),
      completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined,
    }));
  } catch (error) {
    console.error("Failed to load active goals from localStorage:", error);
    return [];
  }
}

/**
 * Save active goals to localStorage
 * @param goals Array of active goals to persist
 */
export function saveActiveGoals(goals: Goal[]): void {
  try {
    localStorage.setItem(ACTIVE_GOALS_KEY, JSON.stringify(goals));
  } catch (error) {
    if (error instanceof Error && error.name === "QuotaExceededError") {
      console.error("localStorage quota exceeded, cannot save active goals");
    } else {
      console.error("Failed to save active goals to localStorage:", error);
    }
  }
}

/**
 * Load completed goals from localStorage
 * @returns Array of completed goals, empty array if not found or parse fails
 */
export function loadCompletedGoals(): Goal[] {
  try {
    const stored = localStorage.getItem(COMPLETED_GOALS_KEY);
    if (!stored) return [];
    const goals = JSON.parse(stored) as Goal[];
    // Convert date strings back to Date objects
    return goals.map((goal) => ({
      ...goal,
      endDate: new Date(goal.endDate),
      createdAt: new Date(goal.createdAt),
      completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined,
    }));
  } catch (error) {
    console.error("Failed to load completed goals from localStorage:", error);
    return [];
  }
}

/**
 * Save completed goals to localStorage
 * @param goals Array of completed goals to persist
 */
export function saveCompletedGoals(goals: Goal[]): void {
  try {
    localStorage.setItem(COMPLETED_GOALS_KEY, JSON.stringify(goals));
  } catch (error) {
    if (error instanceof Error && error.name === "QuotaExceededError") {
      console.error("localStorage quota exceeded, cannot save completed goals");
    } else {
      console.error("Failed to save completed goals to localStorage:", error);
    }
  }
}
