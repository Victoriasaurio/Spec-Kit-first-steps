'use client';

import { useEffect, useRef, useState } from 'react';
import Sortable from 'sortablejs';
import type { Goal } from '@/app/lib/types';
import { createSortableConfig, extractGoalIdsFromDOM, announceScreenReaderMessage } from '@/app/lib/dragDropHelpers';
import { announceGoalSelected, announceGoalMoved, announceGoalConfirmed, announceGoalCanceled, getKeyboardHelpText } from '@/app/lib/screenReaderAnnouncements';

interface DraggableGoalsListProps {
  goals: Goal[];
  onReorder: (newGoalIds: string[]) => void;
  listType: 'active' | 'completed';
  className?: string;
  isSyncing?: boolean;
  isDisabled?: boolean;
  renderGoal: (goal: Goal) => React.ReactNode;
}

export function DraggableGoalsList({
  goals,
  onReorder,
  listType,
  className = '',
  isSyncing = false,
  isDisabled = false,
  renderGoal,
}: DraggableGoalsListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const sortableRef = useRef<any>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [pendingPosition, setPendingPosition] = useState<number | null>(null);

  // Initialize Sortable.js on mount
  useEffect(() => {
    if (!listRef.current || isDisabled) return;

    const handleDragEnd = (event: Sortable.SortableEvent) => {
      if (listRef.current) {
        const newGoalIds = extractGoalIdsFromDOM(listRef.current);
        onReorder(newGoalIds);
      }
    };

    const config = createSortableConfig(listType, handleDragEnd);
    sortableRef.current = new Sortable(listRef.current, config);

    return () => {
      if (sortableRef.current) {
        sortableRef.current.destroy();
        sortableRef.current = null;
      }
    };
  }, [isDisabled, listType, onReorder]);

  // Handle keyboard accessibility for drag-and-drop
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const goal = goals[index];
    if (!goal) return;

    const goalTitle = goal.title;
    const total = goals.length;

    switch (e.key) {
      case 'ArrowUp':
        if (e.shiftKey && index > 0) {
          e.preventDefault();
          // Move goal up one position
          setPendingPosition(index - 1);
          announceGoalMoved(goalTitle, index, total); // position is 1-based in announcement
        }
        break;

      case 'ArrowDown':
        if (e.shiftKey && index < goals.length - 1) {
          e.preventDefault();
          // Move goal down one position
          setPendingPosition(index + 1);
          announceGoalMoved(goalTitle, index + 2, total); // position is 1-based in announcement
        }
        break;

      case 'Enter':
        if (pendingPosition !== null && pendingPosition !== index) {
          e.preventDefault();
          // Confirm the move
          const newGoalIds = [...goals.map((g) => g.id)];
          const goalId = newGoalIds[index];
          newGoalIds.splice(index, 1);
          newGoalIds.splice(pendingPosition, 0, goalId);
          onReorder(newGoalIds);
          announceGoalConfirmed(goalTitle, pendingPosition + 1, total);
          setPendingPosition(null);
        }
        break;

      case 'Escape':
        if (pendingPosition !== null) {
          e.preventDefault();
          // Cancel the move
          announceGoalCanceled(goalTitle);
          setPendingPosition(null);
        }
        break;

      case 'Tab':
        // Allow tab navigation to focus next/previous goal
        if (e.shiftKey && index > 0) {
          // Shift+Tab goes to previous goal
          const prevInput = listRef.current?.querySelector(
            `[data-goal-id="${goals[index - 1]?.id}"] button, [data-goal-id="${goals[index - 1]?.id}"] [tabindex="0"]`
          ) as HTMLElement;
          if (prevInput) {
            e.preventDefault();
            prevInput.focus();
          }
        } else if (!e.shiftKey && index < goals.length - 1) {
          // Tab goes to next goal
          const nextInput = listRef.current?.querySelector(
            `[data-goal-id="${goals[index + 1]?.id}"] button, [data-goal-id="${goals[index + 1]?.id}"] [tabindex="0"]`
          ) as HTMLElement;
          if (nextInput) {
            e.preventDefault();
            nextInput.focus();
          }
        }
        break;
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    const goal = goals[index];
    if (goal) {
      announceGoalSelected(goal.title, index + 1, goals.length);
    }
  };

  return (
    <div
      ref={listRef}
      className={`space-y-2 ${className}`}
      data-list-type={listType}
      role="list"
    >
      {goals.map((goal, index) => (
        <div
          key={goal.id}
          data-goal-id={goal.id}
          role="listitem"
          tabIndex={0}
          aria-label={`Goal: ${goal.title}`}
          aria-describedby={`goal-help-${listType}`}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={() => handleFocus(index)}
          className={`
            relative p-3 rounded-lg border-2 transition-all
            ${pendingPosition === index ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}
            focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none
            hover:shadow-md
            ${isSyncing ? 'opacity-75 pointer-events-none' : ''}
            ${isDisabled ? 'opacity-50 pointer-events-none' : ''}
            data-draggable-handle
          `}
        >
          {renderGoal(goal)}
        </div>
      ))}

      {/* Hidden help text for screen readers */}
      <div id={`goal-help-${listType}`} className="sr-only">
        {getKeyboardHelpText()}
      </div>
    </div>
  );
}
