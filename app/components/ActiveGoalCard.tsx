/**
 * ActiveGoalCard component - displays individual active goal with countdown, status, and actions
 */

import { daysRemaining, getVisualStatus } from "@/app/lib/goalUtils";
import type { Goal } from "@/app/lib/types";
import { cn } from "@/app/utils/cn";
import { Button } from "@/components/ui/button";
import { GoalCountdown } from "./GoalCountdown";

interface ActiveGoalCardProps {
  goal: Goal;
  onCheck: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ActiveGoalCard({
  goal,
  onCheck,
  onDelete,
}: ActiveGoalCardProps) {
  const days = daysRemaining(goal.endDate);
  const status = getVisualStatus(goal.endDate);

  const bgColorClass = cn(
    "border-l-4 rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md transition",
    status === "warning" && "bg-warning border-l-yellow-500",
    status === "critical" && "bg-critical border-l-red-500",
    status === "active" && "bg-white border-l-gray-300"
  );

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${goal.title}"? This cannot be undone.`
      )
    ) {
      onDelete(goal.id);
    }
  };

  return (
    <div className={bgColorClass}>
      <div className="flex items-center flex-1 gap-3">
        <input
          type="checkbox"
          onChange={() => onCheck(goal.id)}
          className="h-5 w-5 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
          aria-label={`Mark ${goal.title} as complete`}
        />
        <div className="flex-1">
          <p className="font-semibold text-gray-800 text-base sm:text-lg">
            {goal.title}
          </p>
          <GoalCountdown days={days} status={status} />
        </div>
      </div>
      <Button
        onClick={handleDelete}
        variant="ghost"
        className="text-red-500 hover:text-red-700 transition ml-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        🗑️
      </Button>
    </div>
  );
}
