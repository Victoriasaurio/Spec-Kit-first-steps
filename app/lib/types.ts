/**
 * Types and interfaces for Goal Tracking application
 */

export interface Goal {
  id: string;
  title: string;
  description?: string;
  endDate: Date;
  createdAt: Date;
  completedAt?: Date;
  // Drag-and-drop reordering support
  order: number; // 0-indexed position within active or completed list
  syncStatus?: 'synced' | 'pending-sync'; // Offline sync tracking
}

export type GoalStatus = "active" | "warning" | "critical";
