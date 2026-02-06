/**
 * GoalCountdown component - displays days remaining badge with status colors
 */

import { daysRemainingDisplay } from "@/app/lib/dateFormatting";
import type { GoalStatus } from "@/app/lib/types";
import { cn } from "@/app/utils/cn";

interface GoalCountdownProps {
  days: number;
  status: GoalStatus;
}

export function GoalCountdown({ days, status }: GoalCountdownProps) {
  const displayText = daysRemainingDisplay(days);

  const statusColorClass = cn(
    "text-sm font-medium",
    status === "warning" && "text-yellow-700",
    status === "critical" && "text-red-700",
    status === "active" && "text-gray-600"
  );

  return <span className={statusColorClass}>{displayText}</span>;
}
