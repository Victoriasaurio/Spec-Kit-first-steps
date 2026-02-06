"use client";

import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import type { Goal } from "@/app/lib/types";
import { 
  loadActiveGoals, 
  saveActiveGoals, 
  loadCompletedGoals, 
  saveCompletedGoals,
  reorderGoals,
  initializeGoalStorage,
} from "@/app/lib/goalStorage";
import { ActiveGoalsColumn } from "@/app/components/ActiveGoalsColumn";
import { CompletedGoalsColumn } from "@/app/components/CompletedGoalsColumn";
import { AddGoalModal } from "@/app/components/AddGoalModal";

export default function Home() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load goals from localStorage and initialize storage on mount
  useEffect(() => {
    const activeGoals = loadActiveGoals();
    const completed = loadCompletedGoals();
    
    // Ensure all goals have order field (migration)
    const activeWithOrder = activeGoals.map((g, i) => ({
      ...g,
      order: g.order !== undefined ? g.order : i,
    }));
    const completedWithOrder = completed.map((g, i) => ({
      ...g,
      order: g.order !== undefined ? g.order : i,
    }));
    
    setGoals(activeWithOrder);
    setCompletedGoals(completedWithOrder);

    // T011: Initialize storage layer with cross-tab sync callback
    initializeGoalStorage((event: any) => {
      // On cross-tab sync, reload goals from localStorage
      const updated = loadActiveGoals();
      const updatedCompleted = loadCompletedGoals();
      setGoals(updated);
      setCompletedGoals(updatedCompleted);

      // Show sync notification
      if (event.listType) {
        console.log(`Goals updated in another tab (${event.listType})`);
      }
    });

    setIsLoading(false);
  }, []);

  // Sync active goals to localStorage
  useEffect(() => {
    if (!isLoading) {
      saveActiveGoals(goals);
    }
  }, [goals, isLoading]);

  // Sync completed goals to localStorage
  useEffect(() => {
    if (!isLoading) {
      saveCompletedGoals(completedGoals);
    }
  }, [completedGoals, isLoading]);

  // Handle goal completion (move to completed)
  const handleCheckGoal = (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;

    setGoals((prev) => prev.filter((g) => g.id !== id));
    setCompletedGoals((prev) => [
      ...prev,
      { ...goal, completedAt: new Date() },
    ]);
  };

  // Handle goal restoration (move back to active)
  const handleRestoreGoal = (id: string) => {
    const goal = completedGoals.find((g) => g.id === id);
    if (!goal) return;

    setCompletedGoals((prev) => prev.filter((g) => g.id !== id));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { completedAt, ...goalWithoutCompleted } = goal;
    setGoals((prev) => [...prev, goalWithoutCompleted]);
  };

  // Handle goal deletion
  const handleDeleteGoal = (id: string, isCompleted: boolean) => {
    if (isCompleted) {
      setCompletedGoals((prev) => prev.filter((g) => g.id !== id));
    } else {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    }
  };

  // T017: Handle reordering of active goals
  const handleReorderActive = (goalIds: string[]) => {
    setIsSyncing(true);
    try {
      reorderGoals(goalIds, 'active');
      
      // Update local state to reflect new order
      const reordered = goalIds
        .map(id => goals.find(g => g.id === id))
        .filter((g): g is Goal => g !== undefined)
        .map((goal, index) => ({ ...goal, order: index }));
      
      setGoals(reordered);
    } catch (error) {
      console.error('Failed to reorder active goals:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // T032: Handle reordering of completed goals
  const handleReorderCompleted = (goalIds: string[]) => {
    setIsSyncing(true);
    try {
      reorderGoals(goalIds, 'completed');
      
      // Update local state to reflect new order
      const reordered = goalIds
        .map(id => completedGoals.find(g => g.id === id))
        .filter((g): g is Goal => g !== undefined)
        .map((goal, index) => ({ ...goal, order: index }));
      
      setCompletedGoals(reordered);
    } catch (error) {
      console.error('Failed to reorder completed goals:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle add goal button click
  const handleAddGoalClick = () => {
    setAddModalOpen(true);
  };

  // Handle new goal creation
  const handleAddGoal = (title: string, endDate: Date) => {
    const newGoal: Goal = {
      id: nanoid(),
      title: title.trim(),
      endDate,
      createdAt: new Date(),
      order: goals.length, // Add to end with proper order
    };

    setGoals((prev) => [...prev, newGoal]);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto">
        <ActiveGoalsColumn
          goals={goals}
          onCheck={handleCheckGoal}
          onDelete={(id) => handleDeleteGoal(id, false)}
          onAddClick={handleAddGoalClick}
          onReorder={handleReorderActive}
          isSyncing={isSyncing}
        />
        <CompletedGoalsColumn
          goals={completedGoals}
          onRestore={handleRestoreGoal}
          onDelete={(id) => handleDeleteGoal(id, true)}
          onReorder={handleReorderCompleted}
          isSyncing={isSyncing}
        />
      </div>
      <AddGoalModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSubmit={handleAddGoal}
      />
    </div>
  );
}

