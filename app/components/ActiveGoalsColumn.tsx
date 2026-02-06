/**
 * ActiveGoalsColumn component - left column with active goals and add button
 */

import type { Goal } from "@/app/lib/types";
import { sortActiveGoals, daysRemaining } from "@/app/lib/goalUtils";
import { AddGoalButton } from "./AddGoalButton";
import { EmptyState } from "./EmptyState";
import { GoalsList } from "./GoalsList";

interface ActiveGoalsColumnProps {
  goals: Goal[];
  onCheck: (id: string) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
}

export function ActiveGoalsColumn({
  goals,
  onCheck,
  onDelete,
  onAddClick,
}: ActiveGoalsColumnProps) {
  // Filter out expired goals (keep only those with 0 or more days remaining)
  const activeGoals = goals.filter((goal) => daysRemaining(goal.endDate) >= 0);
  const sortedGoals = sortActiveGoals(activeGoals);

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 h-fit">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg sm:text-xl font-bold">Active Goals</h2>
        <AddGoalButton onClick={onAddClick} />
      </div>
      {sortedGoals.length === 0 ? (
        <EmptyState type="active" />
      ) : (
        <GoalsList
          goals={sortedGoals}
          onCheck={onCheck}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
