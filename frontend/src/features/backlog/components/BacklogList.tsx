'use client';

import BacklogItem from './BacklogItem';
import { BacklogTask } from '../types';

interface BacklogListProps {
  tasks: BacklogTask[];
  onToggleComplete: (taskId: string) => void;
  onEditTask?: (task: BacklogTask) => void;
}

export default function BacklogList({
  tasks,
  onToggleComplete,
  onEditTask,
}: BacklogListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col w-full px-6 sm:px-12 pt-2">
        <div className="text-center py-12 text-[#6D6D6D]">
          <p className="text-base">No tasks yet. Add one to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full px-6 sm:px-12 pt-2">
      {tasks.map((task) => (
        <BacklogItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEditTask}
        />
      ))}
    </div>
  );
}
