/**
 * EmptyState component - displays contextual empty state messages
 */

interface EmptyStateProps {
  type: "active" | "completed";
}

export function EmptyState({ type }: EmptyStateProps) {
  const message =
    type === "active"
      ? "No active goals. Click 'Add Goal' to get started!"
      : "No completed goals yet. Complete your first goal to celebrate your progress!";

  return (
    <div className="text-center py-12 text-gray-500">
      <p>{message}</p>
    </div>
  );
}
