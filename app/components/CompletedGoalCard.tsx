/**
 * CompletedGoalCard component - displays individual completed goal with restore and delete actions
 */

import { formatCompletedDate } from "@/app/lib/dateFormatting";
import type { Goal } from "@/app/lib/types";
import { Button } from "@/components/ui/button";

interface CompletedGoalCardProps {
  goal: Goal & { completedAt: Date };
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CompletedGoalCard({
  goal,
  onRestore,
  onDelete,
}: CompletedGoalCardProps) {
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
    <div className="bg-gray-100 opacity-75 rounded-lg border border-gray-200 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition">
      <div className="flex-1">
        <p className="line-through text-gray-700 font-semibold text-base sm:text-lg">
          {goal.title}
        </p>
        <p className="text-xs sm:text-sm text-gray-600">
          Completed: {formatCompletedDate(goal.completedAt)}
        </p>
      </div>
      <div className="flex gap-2 ml-2">
        <Button
          onClick={() => onRestore(goal.id)}
          variant="ghost"
          className="text-blue-600 hover:text-blue-700 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          ↻ Restore
        </Button>
        <Button
          onClick={handleDelete}
          variant="ghost"
          className="text-red-500 hover:text-red-700 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          🗑️
        </Button>
      </div>
    </div>
  );
}
