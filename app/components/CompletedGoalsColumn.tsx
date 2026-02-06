/**
 * CompletedGoalsColumn component - right column with completed goals
 */

import type { Goal } from "@/app/lib/types";
import { sortCompletedGoals } from "@/app/lib/goalUtils";
import { EmptyState } from "./EmptyState";
import { DraggableGoalsList } from "./DraggableGoalsList";
import { CompletedGoalCard } from "./CompletedGoalCard";

interface CompletedGoalsColumnProps {
  goals: Goal[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (goalIds: string[]) => void;
  isSyncing?: boolean;
}

export function CompletedGoalsColumn({
  goals,
  onRestore,
  onDelete,
  onReorder,
  isSyncing = false,
}: CompletedGoalsColumnProps) {
  const sortedGoals = sortCompletedGoals(goals);

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 h-fit">
      <h2 className="text-lg sm:text-xl font-bold mb-4">Completed Goals</h2>
      {sortedGoals.length === 0 ? (
        <EmptyState type="completed" />
      ) : (
        <DraggableGoalsList
          goals={sortedGoals}
          onReorder={onReorder}
          listType="completed"
          className="max-h-[600px] overflow-y-auto"
          isSyncing={isSyncing}
          renderGoal={(goal) => (
            <CompletedGoalCard
              goal={goal as Goal & { completedAt: Date }}
              onRestore={onRestore}
              onDelete={onDelete}
            />
          )}
        />
      )}
    </div>
  );
}
