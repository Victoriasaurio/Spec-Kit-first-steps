/**
 * T009: Cross-tab synchronization using localStorage events
 * Detects and broadcasts goal reorder changes across browser tabs
 */

import { getGoalsOrdered } from './goalStorage';

export interface CrossTabSyncEvent {
  listType: 'active' | 'completed';
  goals: any[]; // Goals data
  timestamp: number;
}

/**
 * Callback type for cross-tab sync events
 */
export type CrossTabSyncCallback = (event: CrossTabSyncEvent) => void;

let syncCallback: CrossTabSyncCallback | null = null;
let storageListener: ((event: StorageEvent) => void) | null = null;

/**
 * Initialize cross-tab sync listener
 * @param callback - Function to call when remote reorder is detected
 */
export function initializeCrossTabSync(callback: CrossTabSyncCallback): void {
  syncCallback = callback;

  // Set up storage event listener for changes from other tabs
  storageListener = (event: StorageEvent) => {
    if (event.key === 'doit_goals' || event.key === 'doit_completed') {
      const listType = event.key === 'doit_goals' ? 'active' : 'completed';

      try {
        const newValue = event.newValue ? JSON.parse(event.newValue) : [];

        // Emit sync event to parent component
        if (syncCallback) {
          syncCallback({
            listType,
            goals: newValue,
            timestamp: Date.now(),
          });
        }

        // Dispatch custom event for app-level listeners (e.g., toast notifications)
        window.dispatchEvent(
          new CustomEvent('reorder-override', {
            detail: {
              listType,
              goals: newValue,
              from: 'cross-tab',
            },
          })
        );
      } catch (error) {
        console.error('Failed to parse cross-tab sync data:', error);
      }
    }
  };

  window.addEventListener('storage', storageListener);
}

/**
 * Clean up cross-tab sync listener
 */
export function cleanupCrossTabSync(): void {
  if (storageListener) {
    window.removeEventListener('storage', storageListener);
    storageListener = null;
    syncCallback = null;
  }
}

/**
 * Manually trigger a cross-tab sync check
 * (Useful for debugging or forcing sync)
 */
export function triggerCrossTabSync(): void {
  if (!syncCallback) return;

  try {
    const activeGoals = getGoalsOrdered('active');
    const completedGoals = getGoalsOrdered('completed');

    syncCallback({
      listType: 'active',
      goals: activeGoals,
      timestamp: Date.now(),
    });

    syncCallback({
      listType: 'completed',
      goals: completedGoals,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Failed to trigger cross-tab sync:', error);
  }
}
