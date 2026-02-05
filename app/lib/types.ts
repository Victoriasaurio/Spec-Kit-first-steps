/**
 * Types and interfaces for Goal Tracking application
 */

export interface Goal {
  id: string;
  title: string;
  endDate: Date;
  createdAt: Date;
  completedAt?: Date;
}

export type GoalStatus = "active" | "warning" | "critical";
