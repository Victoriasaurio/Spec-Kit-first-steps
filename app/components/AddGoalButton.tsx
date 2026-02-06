/**
 * AddGoalButton component - CTA button to add a new goal
 */

import { Button } from "@/components/ui/button";

interface AddGoalButtonProps {
  onClick: () => void;
}

export function AddGoalButton({ onClick }: AddGoalButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-10 px-4 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition"
    >
      + Add Goal
    </Button>
  );
}
