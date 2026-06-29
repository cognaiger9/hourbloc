'use client';

import GoalItem from './GoalItem';
import AddGoalButton from './AddGoalButton';
import { WeeklyGoal } from '../types';

interface WeeklyGoalsListProps {
  goals: WeeklyGoal[];
  onToggleComplete: (goalId: string) => void;
  onAddGoalClick: () => void;
  onEditGoal: (goal: WeeklyGoal) => void;
}

export default function WeeklyGoalsList({
  goals,
  onToggleComplete,
  onAddGoalClick,
  onEditGoal,
}: WeeklyGoalsListProps) {
  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  return (
    <section className="flex flex-col w-full">
      {/* Active Goals */}
      {activeGoals.map((goal) => (
        <GoalItem
          key={goal.id}
          goal={goal}
          onToggleComplete={onToggleComplete}
          onEdit={onEditGoal}
        />
      ))}

      {/* Add New Goal Button */}
      <AddGoalButton onClick={onAddGoalClick} />

      {/* Completed Section - Always visible */}
      <div className="mt-8">
        <h3 className="px-3 pb-2 text-xs font-medium tracking-[0.05em] text-[#A3A3A3] uppercase">
          Completed
        </h3>

        {completedGoals.map((goal) => (
          <GoalItem
            key={goal.id}
            goal={goal}
            onToggleComplete={onToggleComplete}
            onEdit={onEditGoal}
          />
        ))}
      </div>
    </section>
  );
}
