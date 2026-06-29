'use client';

import { useState, useMemo, useCallback } from 'react';
import BacklogHeader from './BacklogHeader';
import BacklogTabs from './BacklogTabs';
import BacklogList from './BacklogList';
import CreateTaskModal from './CreateTaskModal';
import { BacklogTask, TabType } from '../types';
import {
  useBacklogQuery,
  useCreateBacklogMutation,
  useUpdateBacklogMutation,
  useDeleteBacklogMutation,
  useToggleBacklogCompletionMutation,
  useMoveToTaskBlueprintMutation,
} from '../hooks/useBacklog';
import { formatDateKey } from '@/utils/dateUtils';

/**
 * Main Backlog component
 */
export default function Backlog() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<BacklogTask | null>(null);

  // Fetch tasks from API
  const { data: tasks = [], isLoading, error } = useBacklogQuery();

  // Mutations
  const createMutation = useCreateBacklogMutation();
  const updateMutation = useUpdateBacklogMutation();
  const deleteMutation = useDeleteBacklogMutation();
  const toggleMutation = useToggleBacklogCompletionMutation();
  const moveToTaskBlueprintMutation = useMoveToTaskBlueprintMutation();

  // Filter tasks based on active tab
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => (activeTab === 'active' ? !task.completed : task.completed))
      .sort((a, b) => a.order - b.order);
  }, [tasks, activeTab]);

  const handleToggleComplete = useCallback((taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    toggleMutation.mutate({ taskId, currentCompleted: task.completed });
  }, [tasks, toggleMutation]);

  const handleAddTask = async (data: { text: string; description?: string }) => {
    await createMutation.mutateAsync({
      text: data.text,
      description: data.description,
      order: tasks.length,
    });
  };

  const handleEditTask = useCallback((task: BacklogTask) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  const handleUpdateTask = async (data: { text: string; description?: string }) => {
    if (!editingTask) return;

    await updateMutation.mutateAsync({
      id: editingTask.id,
      updates: {
        text: data.text,
        description: data.description,
      },
    });
    setEditingTask(null);
  };

  const handleDeleteTask = async () => {
    if (!editingTask) return;

    await deleteMutation.mutateAsync(editingTask.id);
    setEditingTask(null);
  };

  const handleMoveToToday = async () => {
    if (!editingTask) return;

    // Get today's date and format as YYYY-MM-DD
    const today = new Date();
    const targetDate = formatDateKey(today);

    await moveToTaskBlueprintMutation.mutateAsync({
      taskId: editingTask.id,
      targetDate,
    });

    setEditingTask(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // Show error state
  if (error) {
    return (
      <div className="flex-1 h-full bg-white overflow-y-auto">
        <main className="w-full max-w-[1024px] mx-auto flex flex-col pt-12 sm:pt-24 pb-12">
          <div className="text-center text-red-600 p-4">
            Error loading backlog: {error.message}
          </div>
        </main>
      </div>
    );
  }

  // Show loading state
  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex-1 h-full bg-white overflow-y-auto">
        <main className="w-full max-w-[1024px] mx-auto flex flex-col pt-12 sm:pt-24 pb-12">
          <div className="text-center text-gray-600 p-4">Loading backlog...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-white overflow-y-auto">
      <main className="w-full max-w-[1024px] mx-auto flex flex-col pt-12 sm:pt-24 pb-12">
        <BacklogHeader onAddTask={() => setIsModalOpen(true)} />

        <BacklogTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <BacklogList
          tasks={filteredTasks}
          onToggleComplete={handleToggleComplete}
          onEditTask={handleEditTask}
        />
      </main>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingTask ? handleUpdateTask : handleAddTask}
        onDelete={editingTask ? handleDeleteTask : undefined}
        onMoveToToday={editingTask ? handleMoveToToday : undefined}
        mode={editingTask ? 'edit' : 'create'}
        initialTask={
          editingTask
            ? { text: editingTask.text, description: editingTask.description }
            : undefined
        }
      />
    </div>
  );
}
