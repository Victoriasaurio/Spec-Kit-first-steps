/**
 * T010: Screen reader announcement utilities for keyboard accessibility
 * Provides screen reader feedback for keyboard-driven drag-and-drop operations
 */

/**
 * Get or create a live region for screen reader announcements
 * @returns HTMLElement configured as ARIA live region
 */
function getOrCreateLiveRegion(): HTMLElement {
  let liveRegion = document.querySelector('[role="status"][aria-live="polite"]') as HTMLElement | null;

  if (!liveRegion) {
    liveRegion = document.createElement('div') as HTMLElement;
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.className = 'sr-only'; // Screen reader only
    document.body.appendChild(liveRegion);
  }

  return liveRegion;
}

/**
 * Announce a message to screen readers
 * @param message - Message to announce
 */
export function announceToScreenReader(message: string): void {
  try {
    const liveRegion = getOrCreateLiveRegion();
    liveRegion.textContent = message;

    // Clear message after announcement (prevents redundant reads)
    setTimeout(() => {
      if (liveRegion.textContent === message) {
        liveRegion.textContent = '';
      }
    }, 2000);
  } catch (error) {
    console.error('Failed to announce to screen reader:', error);
  }
}

/**
 * Announce that a goal has been selected/focused
 * @param goalTitle - Title of the focused goal
 * @param position - Current position in list (1-based)
 * @param total - Total items in list
 */
export function announceGoalSelected(goalTitle: string, position: number, total: number): void {
  announceToScreenReader(
    `Goal selected: ${goalTitle}. Position ${position} of ${total}. Use arrow keys to move.`
  );
}

/**
 * Announce that a goal is being moved
 * @param goalTitle - Title of the goal being moved
 * @param newPosition - New position (1-based)
 * @param total - Total items in list
 */
export function announceGoalMoved(goalTitle: string, newPosition: number, total: number): void {
  announceToScreenReader(
    `Goal moved to position ${newPosition} of ${total}. Press Enter to confirm or Escape to cancel.`
  );
}

/**
 * Announce that a goal move has been confirmed
 * @param goalTitle - Title of the moved goal
 * @param newPosition - Final position (1-based)
 * @param total - Total items in list
 */
export function announceGoalConfirmed(goalTitle: string, newPosition: number, total: number): void {
  announceToScreenReader(
    `Goal repositioned to position ${newPosition} of ${total}.`
  );
}

/**
 * Announce that a goal move has been canceled
 * @param goalTitle - Title of the goal that was moved
 */
export function announceGoalCanceled(goalTitle: string): void {
  announceToScreenReader(`Move canceled. ${goalTitle} remains in original position.`);
}

/**
 * Announce keyboard help text for drag-and-drop
 */
export function announceKeyboardHelp(): void {
  announceToScreenReader(
    'Keyboard instructions: Use Tab to focus goals. Arrow Up/Down to move goal up or down. Shift+Arrow for faster movement. Press Enter to confirm move, Escape to cancel.'
  );
}

/**
 * Announce error message
 * @param message - Error message
 */
export function announceError(message: string): void {
  try {
    const errorRegion = document.querySelector('[role="alert"]');
    if (errorRegion) {
      errorRegion.textContent = message;
    } else {
      announceToScreenReader(`Error: ${message}`);
    }
  } catch (error) {
    console.error('Failed to announce error:', error);
  }
}

/**
 * Get keyboard help text (for aria-describedby)
 * @returns Help text string
 */
export function getKeyboardHelpText(): string {
  return 'Use arrow keys to navigate goals. Press Shift+Arrow to move up or down. Press Enter to confirm repositioning. Press Escape to cancel.';
}
