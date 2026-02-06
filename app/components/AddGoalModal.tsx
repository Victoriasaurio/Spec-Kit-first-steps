/**
 * AddGoalModal component - modal form for creating new goals
 */

"use client";

import { useState } from "react";
import { validateGoal } from "@/app/lib/goalUtils";
import { startOfDay } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, endDate: Date) => void;
}

export function AddGoalModal({
  open,
  onOpenChange,
  onSubmit,
}: AddGoalModalProps) {
  const [title, setTitle] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!endDate) {
      setError("End date is required");
      return;
    }

    const selectedDate = new Date(endDate);
    const validationError = validateGoal(title, selectedDate);

    if (validationError) {
      setError(validationError);
      return;
    }

    // Submit with normalized date (start of day)
    onSubmit(title, startOfDay(selectedDate));

    // Reset form and close
    setTitle("");
    setEndDate("");
    setError(null);
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setTitle("");
      setEndDate("");
      setError(null);
    }
    onOpenChange(newOpen);
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Goal Title
            </label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Launch feature"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-0"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-2">
              End Date
            </label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={todayString}
              className="w-full focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-0"
            />
          </div>

          {error && (
            <div className="text-red-700 text-sm bg-red-50 p-2 rounded border border-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Create Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
