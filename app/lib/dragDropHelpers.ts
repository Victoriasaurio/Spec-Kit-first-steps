/**
 * Drag-and-drop helper utilities for Sortable.js integration
 * Provides configuration and event handling for goal reordering
 */

import Sortable from 'sortablejs';
import type { Goal } from './types';

/**
 * Configuration for Sortable.js instances
 */
export interface SortableConfig {
  ghostClass?: string;
  dragClass?: string;
  handle?: string;
  onEnd?: (event: Sortable.SortableEvent) => void;
  animation?: number;
  group?: string | { name: string; pull?: boolean | 'clone'; put?: boolean };
  filter?: string;
  disabled?: boolean;
}

/**
 * Create default Sortable.js configuration for goal lists
 * @param listType - 'active' or 'completed' for group separation
 * @param onEnd - Callback when drag operation completes
 * @returns Sortable configuration object
 */
export function createSortableConfig(
  listType: 'active' | 'completed',
  onEnd: (event: Sortable.SortableEvent) => void
): SortableConfig {
  return {
    ghostClass: 'sortable-ghost',
    dragClass: 'sortable-drag',
    animation: 150,
    // Separate groups prevent dragging between active and completed lists
    group: {
      name: `goals-${listType}`,
      pull: false, // Prevent pulling from this group
      put: false, // Prevent putting into this group from others
    },
    handle: '[data-draggable-handle]', // Only drag from goal cards
    onEnd,
    disabled: false,
  };
}

/**
 * Extract goal IDs from sorted DOM elements
 * @param containerElement - DOM element containing sorted goals
 * @returns Array of goal IDs in new order
 */
export function extractGoalIdsFromDOM(containerElement: HTMLElement): string[] {
  const elements = Array.from(containerElement.querySelectorAll('[data-goal-id]'));
  return elements
    .map((el) => el.getAttribute('data-goal-id'))
    .filter((id): id is string => id !== null);
}

/**
 * Announce screen reader message for keyboard accessibility
 * @param message - Message to announce
 */
export function announceScreenReaderMessage(message: string): void {
  // Find or create live region for screen reader announcements
  let liveRegion = document.querySelector('[role="status"][aria-live="polite"]');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.className = 'sr-only'; // Screen reader only
    document.body.appendChild(liveRegion);
  }

  // Update message
  liveRegion.textContent = message;

  // Clear after announcement
  setTimeout(() => {
    liveRegion!.textContent = '';
  }, 2000);
}

/**
 * Get insertion line element or create if not present
 * @returns DOM element for insertion indicator
 */
export function getOrCreateInsertionLine(): HTMLDivElement {
  let line = document.querySelector('.insertion-line') as HTMLDivElement | null;

  if (!line) {
    line = document.createElement('div');
    line.className = 'insertion-line h-0.5 my-1';
    line.style.display = 'none';
  }

  return line;
}

/**
 * Show insertion indicator at specified position
 * @param containerElement - Container with sorted goals
 * @param position - Index where insertion line should appear
 */
export function showInsertionIndicator(
  containerElement: HTMLElement,
  position: number
): void {
  const line = getOrCreateInsertionLine();
  const children = Array.from(containerElement.children);

  if (position >= 0 && position < children.length) {
    line.style.display = 'block';
    children[position].parentNode?.insertBefore(line, children[position]);
  }
}

/**
 * Hide insertion indicator
 */
export function hideInsertionIndicator(): void {
  const line = document.querySelector('.insertion-line') as HTMLDivElement | null;
  if (line) {
    line.style.display = 'none';
  }
}

/**
 * Calculate list position from mouse/touch coordinates
 * @param containerElement - Container with sorted goals
 * @param clientY - Y coordinate of mouse/touch
 * @returns Index position or -1 if outside bounds
 */
export function calculateDropPosition(
  containerElement: HTMLElement,
  clientY: number
): number {
  const rect = containerElement.getBoundingClientRect();
  if (clientY < rect.top || clientY > rect.bottom) {
    return -1;
  }

  const children = Array.from(containerElement.children) as HTMLElement[];
  const goalElements = children.filter((child) => child.hasAttribute('data-goal-id'));

  for (let i = 0; i < goalElements.length; i++) {
    const childRect = goalElements[i].getBoundingClientRect();
    if (clientY < childRect.top + childRect.height / 2) {
      return i;
    }
  }

  return goalElements.length;
}
