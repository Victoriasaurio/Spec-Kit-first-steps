/**
 * CompletedGoalsColumn component - right column with completed goals
 */

import type { Goal } from "@/app/lib/types";
import { sortCompletedGoals } from "@/app/lib/goalUtils";
import { EmptyState } from "./EmptyState";
import { GoalsList } from "./GoalsList";

interface CompletedGoalsColumnProps {
  goals: Goal[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CompletedGoalsColumn({
  goals,
  onRestore,
  onDelete,
}: CompletedGoalsColumnProps) {
  const sortedGoals = sortCompletedGoals(goals);

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 h-fit">
      <h2 className="text-lg sm:text-xl font-bold mb-4">Completed Goals</h2>
      {sortedGoals.length === 0 ? (
        <EmptyState type="completed" />
      ) : (
        <GoalsList
          goals={sortedGoals}
          isCompleted={true}
          onRestore={onRestore}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
