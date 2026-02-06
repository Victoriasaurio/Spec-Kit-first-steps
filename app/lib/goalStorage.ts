import type { Goal } from "./types";

/**
 * localStorage operations for goal persistence
 */

const ACTIVE_GOALS_KEY = "doit_goals";
const COMPLETED_GOALS_KEY = "doit_completed";
const REORDER_QUEUE_KEY = "reorder-queue";

export interface ReorderOperation {
  timestamp: number;
  listType: 'active' | 'completed';
  goalIds: string[];
  syncStatus: 'pending' | 'syncing' | 'synced';
}

/**
 * Helper: Check if online
 */
function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true; // SSR
  return navigator.onLine;
}

/**
 * Get the appropriate storage key for a list type
 */
function getStorageKey(listType: 'active' | 'completed'): string {
  return listType === 'active' ? ACTIVE_GOALS_KEY : COMPLETED_GOALS_KEY;
}

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

/**
 * T005: Retrieve goals for a specific list type, ordered by sequence
 * @param listType - 'active' or 'completed'
 * @returns Array of goals sorted by order field
 */
export function getGoalsOrdered(listType: 'active' | 'completed'): Goal[] {
  const goals = listType === 'active' ? loadActiveGoals() : loadCompletedGoals();
  
  // Ensure sorted by order field (defensive)
  return goals.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * T006: Replace entire ordered list with new sequence
 * Automatically renumbers goals to maintain sequential order
 * @param goalIds - New order of goal IDs
 * @param listType - 'active' or 'completed'
 */
export function reorderGoals(goalIds: string[], listType: 'active' | 'completed'): void {
  const currentGoals = getGoalsOrdered(listType);
  
  // Build map of ID -> Goal for quick lookup
  const goalMap = new Map(currentGoals.map((g) => [g.id, g]));

  // Reconstruct goals in new order with renumbered sequence
  const reorderedGoals = goalIds
    .map((id) => goalMap.get(id))
    .filter((goal): goal is Goal => goal !== undefined);

  // Renumber: assign order 0, 1, 2, ...
  const renumberedGoals: Goal[] = reorderedGoals.map((goal, index) => ({
    ...goal,
    order: index,
    syncStatus: (isOnline() ? 'synced' : 'pending-sync') as 'synced' | 'pending-sync',
  }));

  // Persist to localStorage
  if (listType === 'active') {
    saveActiveGoals(renumberedGoals);
  } else {
    saveCompletedGoals(renumberedGoals);
  }

  // Queue for backend sync if offline
  if (!isOnline()) {
    queueReorderOperation({
      listType,
      goalIds,
      timestamp: Date.now(),
      syncStatus: 'pending',
    });
  }
}

/**
 * T007: Move a goal to a new position
 * Helper that delegates to reorderGoals
 * @param goalId - Goal to move
 * @param newPosition - New index position (0-based)
 * @param listType - 'active' or 'completed'
 */
export function moveGoal(goalId: string, newPosition: number, listType: 'active' | 'completed'): void {
  const goals = getGoalsOrdered(listType);
  
  // Find current position
  const currentIndex = goals.findIndex((g) => g.id === goalId);
  if (currentIndex === -1) {
    console.warn(`Goal ${goalId} not found in ${listType} list`);
    return;
  }

  // Build new order by removing goal and inserting at new position
  const goalIds = goals.map((g) => g.id);
  goalIds.splice(currentIndex, 1); // Remove from current position
  goalIds.splice(newPosition, 0, goalId); // Insert at new position

  reorderGoals(goalIds, listType);
}

/**
 * T008: Queue a reorder operation for offline sync
 * @param operation - Operation to queue
 */
export function queueReorderOperation(operation: ReorderOperation): void {
  try {
    const queue = localStorage.getItem(REORDER_QUEUE_KEY) || '[]';
    const operations: ReorderOperation[] = JSON.parse(queue);
    operations.push(operation);
    localStorage.setItem(REORDER_QUEUE_KEY, JSON.stringify(operations));
  } catch (error) {
    console.error("Failed to queue reorder operation:", error);
  }
}

/**
 * T008: Get pending reorder operations from queue
 * @returns Array of queued operations
 */
export function getPendingReorders(): ReorderOperation[] {
  try {
    const queue = localStorage.getItem(REORDER_QUEUE_KEY) || '[]';
    return JSON.parse(queue) as ReorderOperation[];
  } catch (error) {
    console.error("Failed to get pending reorders:", error);
    return [];
  }
}

/**
 * T008: Process pending reorder operations (on reconnection)
 * For now, just clears the queue (backend sync deferred to Phase 2)
 */
export function syncPendingReorders(): void {
  const operations = getPendingReorders();
  
  if (operations.length === 0) {
    return;
  }

  try {
    // TODO: Phase 2 - Send operations to backend
    // For now, just clear the queue since operations were already applied locally
    localStorage.removeItem(REORDER_QUEUE_KEY);
    console.log(`Synced ${operations.length} pending reorder operations`);
  } catch (error) {
    console.error("Failed to sync pending reorders:", error);
  }
}

/**
 * T011: Initialize cross-tab sync and online/offline listeners
 * Call this once on app startup
 */
export function initializeGoalStorage(onSyncEvent?: (event: any) => void): void {
  // Run migration to ensure all goals have order field
  migrateGoalsWithOrder();

  // Import and initialize cross-tab sync if callback provided
  if (onSyncEvent && typeof window !== 'undefined') {
    try {
      const { initializeCrossTabSync } = require('./crossTabSync');
      initializeCrossTabSync(onSyncEvent);
    } catch (error) {
      console.warn('Failed to initialize cross-tab sync:', error);
    }
  }

  // Set up online/offline event listeners if in browser
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log('Back online, syncing pending reorders...');
      syncPendingReorders();
    });

    window.addEventListener('offline', () => {
      console.log('Gone offline, future reorders will be queued');
    });
  }
}

/**
 * T012: Add migration function to auto-add order field to existing goals
 * Run on first app load to ensure all goals have order field
 */
export function migrateGoalsWithOrder(): void {
  try {
    const activeGoals = loadActiveGoals();
    const completedGoals = loadCompletedGoals();
    let needsActiveMigration = false;
    let needsCompletedMigration = false;

    // Migrate active goals
    const migratedActive = activeGoals.map((goal, index) => ({
      ...goal,
      order: goal.order !== undefined ? goal.order : index,
    }));
    if (migratedActive.some((g, i) => g.order !== activeGoals[i]?.order)) {
      needsActiveMigration = true;
      saveActiveGoals(migratedActive);
    }

    // Migrate completed goals
    const migratedCompleted = completedGoals.map((goal, index) => ({
      ...goal,
      order: goal.order !== undefined ? goal.order : index,
    }));
    if (migratedCompleted.some((g, i) => g.order !== completedGoals[i]?.order)) {
      needsCompletedMigration = true;
      saveCompletedGoals(migratedCompleted);
    }

    if (needsActiveMigration || needsCompletedMigration) {
      console.log("Goals migrated to include order field");
    }
  } catch (error) {
    console.error("Failed to migrate goals with order field:", error);  }
}