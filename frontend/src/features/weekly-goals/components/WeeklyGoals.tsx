'use client';

import { useState } from 'react';
import WeeklyGoalsHeader from './WeeklyGoalsHeader';
import WeeklyGoalsList from './WeeklyGoalsList';
import CreateGoalModal from './CreateGoalModal';
import { useWeekNavigation } from '../hooks/useWeekNavigation';
import { WeeklyGoal } from '../types';
import { getMondayOfWeek } from '@/utils/dateUtils';
import {
  useWeeklyGoalsQuery,
  useCreateWeeklyGoalMutation,
  useUpdateWeeklyGoalMutation,
  useDeleteWeeklyGoalMutation,
} from '@/hooks/useWeeklyGoals';

/**
 * Main Weekly Goals component
 */
export default function WeeklyGoals() {
  const { currentDate, navigateWeek, goToToday, isCurrentlyViewingToday } = useWeekNavigation();
  const weekStart = getMondayOfWeek(currentDate);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<WeeklyGoal | null>(null);

  // Fetch goals for the current week
  const { data: goals = [], isLoading, error } = useWeeklyGoalsQuery(weekStart);
  const createMutation = useCreateWeeklyGoalMutation();
  const updateMutation = useUpdateWeeklyGoalMutation();
  const deleteMutation = useDeleteWeeklyGoalMutation();

  const handleToggleComplete = async (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    updateMutation.mutate({
      id: goalId,
      updates: { completed: !goal.completed },
    });
  };

  const handleAddGoal = (data: { title: string; description?: string }) => {
    // Close modal immediately for optimistic update
    setIsModalOpen(false);

    // Fire mutation without waiting (optimistic update handles UI)
    createMutation.mutate(
      {
        text: data.title,
        description: data.description,
        completed: false,
        order: goals.length,
        weekStart,
      },
      {
        onError: (error) => {
          console.error('Failed to create goal:', error);
          // Error handling could show a toast notification here
        },
      }
    );
  };

  const handleEditGoal = (goal: WeeklyGoal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleUpdateGoal = (data: { title: string; description?: string }) => {
    if (!editingGoal) return;

    // Close modal immediately for optimistic update
    setIsModalOpen(false);
    setEditingGoal(null);

    // Fire mutation without waiting (optimistic update handles UI)
    updateMutation.mutate(
      {
        id: editingGoal.id,
        updates: {
          text: data.title,
          description: data.description,
        },
      },
      {
        onError: (error) => {
          console.error('Failed to update goal:', error);
          // Error handling could show a toast notification here
        },
      }
    );
  };

  const handleDeleteGoal = () => {
    if (!editingGoal) return;

    // Close modal immediately for optimistic update
    setIsModalOpen(false);
    const goalId = editingGoal.id;
    setEditingGoal(null);

    // Fire mutation without waiting (optimistic update handles UI)
    deleteMutation.mutate(goalId, {
      onError: (error) => {
        console.error('Failed to delete goal:', error);
        // Error handling could show a toast notification here
      },
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex-1 h-full bg-white overflow-y-auto">
        <main className="w-full max-w-[1024px] mx-auto flex flex-col gap-10 pt-16 pb-16 px-6">
          <div className="text-center text-gray-500">Loading goals...</div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex-1 h-full bg-white overflow-y-auto">
        <main className="w-full max-w-[1024px] mx-auto flex flex-col gap-10 pt-16 pb-16 px-6">
          <div className="text-center text-red-500">
            Error loading goals: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-white overflow-y-auto">
      <main className="w-full max-w-[1024px] mx-auto flex flex-col gap-10 pt-16 pb-16 px-6">
        <WeeklyGoalsHeader
          weekStart={weekStart}
          onNavigateWeek={navigateWeek}
          onGoToToday={goToToday}
          isViewingToday={isCurrentlyViewingToday}
        />

        <WeeklyGoalsList
          goals={goals}
          onToggleComplete={handleToggleComplete}
          onAddGoalClick={() => setIsModalOpen(true)}
          onEditGoal={handleEditGoal}
        />
      </main>

      <CreateGoalModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingGoal ? handleUpdateGoal : handleAddGoal}
        onDelete={editingGoal ? handleDeleteGoal : undefined}
        weekStart={weekStart}
        mode={editingGoal ? 'edit' : 'create'}
        initialGoal={
          editingGoal
            ? { title: editingGoal.text, description: editingGoal.description }
            : undefined
        }
      />
    </div>
  );
}
