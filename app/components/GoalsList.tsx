/**
 * GoalsList component - renders a scrollable list of goals
 */

import type { Goal } from "@/app/lib/types";
import { ActiveGoalCard } from "./ActiveGoalCard";
import { CompletedGoalCard } from "./CompletedGoalCard";

interface GoalsListProps {
  goals: Goal[];
  isCompleted?: boolean;
  onCheck?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete: (id: string) => void;
}

export function GoalsList({
  goals,
  isCompleted = false,
  onCheck,
  onRestore,
  onDelete,
}: GoalsListProps) {
  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto">
      {goals.map((goal) =>
        isCompleted ? (
          <CompletedGoalCard
            key={goal.id}
            goal={goal as Goal & { completedAt: Date }}
            onRestore={onRestore!}
            onDelete={onDelete}
          />
        ) : (
          <ActiveGoalCard
            key={goal.id}
            goal={goal}
            onCheck={onCheck!}
            onDelete={onDelete}
          />
        )
      )}
    </div>
  );
}
