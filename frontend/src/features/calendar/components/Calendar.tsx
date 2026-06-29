'use client';

import { useState, useMemo } from 'react';
import BlockModal from '@/features/calendar/components/BlockModal';
import AddTaskModal from '@/features/calendar/components/AddTaskModal';
import DayView from '@/features/calendar/components/views/DayView/DayView';
import WeeklyTodoView from '@/features/calendar/components/views/WeeklyTodoView/WeeklyTodoView';
import WeeklyCalendarView from '@/features/calendar/components/views/WeeklyCalendarView/WeeklyCalendarView';
import UnifiedCalendarHeader from '@/features/calendar/components/UnifiedCalendarHeader';
import { getWeekDates, isViewingToday, getMondayOfWeek, isSameDay } from '@/utils/dateUtils';
import { useCalendarNavigation } from '@/features/calendar/hooks/useCalendarNavigation';
import { useCalendarStore } from '@/features/calendar/store/calendarStore';
import { useTaskBlueprintsStore } from '@/features/calendar/store/taskBlueprintsStore';
import { useTagsQuery } from '@/hooks/useTags';
import { useWeeklyGoals } from '@/hooks/useWeeklyGoals';
import { useUser } from '@/contexts/UserContext';
import { CalendarBlock } from '@/features/calendar/types/calendarBlock';
import { TaskBlueprint } from '@/features/calendar/types/taskBlueprint';
import { useCreateBlockMutation, useUpdateBlockMutation, useDeleteBlockMutation, blockKeys } from '@/features/calendar/hooks/useBlocks';
import { useTaskBlueprintsQuery, useCreateTaskBlueprintMutation, useUpdateTaskBlueprintMutation, useDeleteTaskBlueprintMutation } from '@/features/calendar/hooks/useTaskBlueprints';
import { useQueryClient } from '@tanstack/react-query';
import { findBlock } from '@/features/calendar/utils/blockLookup';

type CalendarViewType = 'todo' | 'day' | 'calendar';

export default function Calendar() {
  const [viewType, setViewType] = useState<CalendarViewType>('day');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [addTaskDate, setAddTaskDate] = useState<Date | null>(null);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskBlueprint | null>(null);
  const { data: tags = [] } = useTagsQuery();
  const { timezone } = useUser();
  const queryClient = useQueryClient();

  // Navigation (pure logic, no state sharing)
  const { currentDate, viewMode, datesToShow, navigateDate, navigateDay, goToToday } =
    useCalendarNavigation();

  // Get weekly goals for the current week
  const weekStart = useMemo(() => getMondayOfWeek(currentDate), [currentDate]);
  const { activeGoals: weeklyGoals } = useWeeklyGoals(weekStart);

  // Fetch tasks with React Query
  const today = new Date();
  const tasksStartDate = useMemo(() => {
    const start = new Date(today);
    start.setDate(start.getDate() - 7);
    return start;
  }, []);
  const tasksEndDate = useMemo(() => {
    const end = new Date(today);
    end.setDate(end.getDate() + 30);
    return end;
  }, []);

  const { data: tasks = [], isLoading: isLoadingTasks } = useTaskBlueprintsQuery({
    startDate: tasksStartDate,
    endDate: tasksEndDate,
  });

  // Filter tasks for DayView (current date)
  const dayTasks = useMemo(
    () => tasks.filter((task) => isSameDay(task.date, currentDate)),
    [tasks, currentDate]
  );

  // Filter tasks for WeeklyTodoView (current week)
  const weekTasks = useMemo(() => {
    const weekDates = getWeekDates(currentDate, 'week');
    return tasks.filter((task) => weekDates.some((date) => isSameDay(task.date, date)));
  }, [tasks, currentDate]);

  // Block mutations
  const createBlock = useCreateBlockMutation(timezone);
  const updateBlock = useUpdateBlockMutation(timezone);
  const deleteBlockMutation = useDeleteBlockMutation();

  // Task mutations
  const createTask = useCreateTaskBlueprintMutation();
  const updateTask = useUpdateTaskBlueprintMutation();
  const deleteTaskMutation = useDeleteTaskBlueprintMutation();

  // UI state from store
  const isModalOpen = useCalendarStore((state) => state.isModalOpen);
  const selectedBlockId = useCalendarStore((state) => state.selectedBlockId);
  const modalPosition = useCalendarStore((state) => state.modalPosition);
  const closeModal = useCalendarStore((state) => state.closeModal);

  // Get selected block (checks store for temp, then cache for saved)
  const selectedBlock = findBlock(selectedBlockId, queryClient);

  // Task store (only selection state)
  const selectTask = useTaskBlueprintsStore((state) => state.selectTask);

  // Handle adding a new task - open AddTaskModal
  const handleAddTask = (date: Date) => {
    setAddTaskDate(date);
    setIsAddTaskModalOpen(true);
  };

  // Handle saving task from AddTaskModal
  const handleSaveTask = async (taskData: Partial<TaskBlueprint>) => {
    if (!addTaskDate) return;

    if (viewType === 'todo' || viewType === 'day') {
      // Save as TaskBlueprint for todo/day views
      const tag = tags.find((t) => t.name === taskData.tag);
      createTask.mutateAsync({
        title: taskData.title || 'Untitled',
        description: taskData.description,
        date: addTaskDate,
        tag: taskData.tag,
        tagId: tag?.id || null,
        weeklyGoalId: taskData.weeklyGoalId,
        completed: false,
        order: 0,
      });
    } else {
      // For calendar view, save as CalendarBlock directly
      const tag = tags.find((t) => t.name === taskData.tag);
      const block: CalendarBlock & { tagId?: string | null } = {
        id: `temp-${Date.now()}`,
        date: addTaskDate,
        startTime: 9, // Default 9 AM
        endTime: 10, // Default 1 hour
        title: taskData.title || 'Untitled',
        description: taskData.description || '',
        tag: taskData.tag || '',
        tagId: tag?.id || null,
        weeklyGoalId: taskData.weeklyGoalId,
        isNewlyCreated: true,
      };
      createBlock.mutateAsync(block);
    }
    setIsAddTaskModalOpen(false);
    setAddTaskDate(null);
  };

  // Handle task click (for tasks in Day View and Todo View) - open edit modal
  const handleTaskClick = (task: TaskBlueprint) => {
    // Only allow editing in day/todo views, and only for actual TaskBlueprints (not blocks)
    // Check if task exists in the tasks query data to ensure it's editable
    const isEditableTask = tasks.some((t) => t.id === task.id);

    if ((viewType === 'day' || viewType === 'todo') && isEditableTask) {
      setEditingTask(task);
      setIsEditTaskModalOpen(true);
    } else {
      // Fallback to selection for other cases
      selectTask(task.id);
    }
  };

  // Handle saving edited task
  const handleEditTask = async (taskData: Partial<TaskBlueprint>) => {
    if (!editingTask) return;

    const tag = tags.find((t) => t.name === taskData.tag);
    await updateTask.mutateAsync({
      id: editingTask.id,
      updates: {
        title: taskData.title,
        description: taskData.description,
        tag: taskData.tag,
        weeklyGoalId: taskData.weeklyGoalId,
      },
      tagId: tag?.id || null,
    });

    setIsEditTaskModalOpen(false);
    setEditingTask(null);
  };

  // Handle deleting task
  const handleDeleteTask = async () => {
    if (!editingTask) return;

    await deleteTaskMutation.mutateAsync(editingTask.id);

    setIsEditTaskModalOpen(false);
    setEditingTask(null);
  };

  // Handle moving task to backlog
  const handleMoveToBacklog = async () => {
    if (!editingTask) return;

    // TODO: Implement move to backlog API call
    // For now, just delete the task
    await deleteTaskMutation.mutateAsync(editingTask.id);

    setIsEditTaskModalOpen(false);
    setEditingTask(null);
  };

  // Calculate stats for header
  const stats = useMemo(() => {
    if (viewType === 'todo') {
      // Count pending tasks for the week
      const pendingTasks = weekTasks.filter((task) => !task.completed).length;
      return { pendingTasks, goalsCount: 0 };
    }

    if (viewType === 'day') {
      // Count pending tasks for the current day
      const pendingTasks = dayTasks.filter((task) => !task.completed).length;
      return { pendingTasks, goalsCount: 0 };
    }

    // For calendar view, no task stats (only shows blocks)
    return { pendingTasks: 0, goalsCount: 0 };
  }, [weekTasks, dayTasks, viewType]);

  // Handle go to today - use correct view mode based on viewType
  const handleGoToToday = () => {
    const effectiveViewMode = viewType === 'day' ? 'day' : viewMode;
    goToToday(effectiveViewMode);
  };

  // Common modal close handler
  const handleModalClose = async () => {
    const currentSelectedBlockId = useCalendarStore.getState().selectedBlockId;

    if (currentSelectedBlockId) {
      const blockInData = findBlock(currentSelectedBlockId, queryClient);
      const isStillTempBlock = currentSelectedBlockId.startsWith('temp-') && blockInData?.isNewlyCreated;

      if (isStillTempBlock) {
        // Clear temp block from store (no API call needed)
        const store = useCalendarStore.getState();
        store.clearTempBlock();
      }
    }

    closeModal();
  };

  // Show loading state
  if (isLoadingTasks) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-background text-foreground">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background text-foreground">
      {/* Unified Header */}
      <UnifiedCalendarHeader
        currentDate={currentDate}
        viewType={viewType}
        viewMode={viewType === 'day' ? 'day' : viewMode}
        isViewingToday={isViewingToday(currentDate, viewType === 'day' ? 'day' : viewMode, datesToShow)}
        pendingTasks={stats.pendingTasks}
        goalsCount={stats.goalsCount}
        onViewChange={setViewType}
        onNavigateDate={navigateDate}
        onNavigateDay={viewType === 'day' ? navigateDay : undefined}
        onGoToToday={handleGoToToday}
      />

      {/* View Content */}
      {viewType === 'todo' && (
        <WeeklyTodoView
          currentDate={currentDate}
          tasks={weekTasks}
          tags={tags}
          onAddTask={handleAddTask}
          onTaskClick={handleTaskClick}
        />
      )}

      {viewType === 'day' && (
        <DayView
          currentDate={currentDate}
          tasks={dayTasks}
          tags={tags}
          timezone={timezone}
          onAddTask={handleAddTask}
          onTaskClick={handleTaskClick}
        />
      )}

      {viewType === 'calendar' && (
        <WeeklyCalendarView
          currentDate={currentDate}
          tags={tags}
          timezone={timezone}
        />
      )}

      {/* Floating Block Editing Panel */}
      {isModalOpen && selectedBlock && (
        <BlockModal
          block={selectedBlock}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={async (block) => {
            const tag = tags.find((t) => t.name === block.tag);
            const tagId = tag?.id || null;
            if (block.id.startsWith('temp-')) {
              await createBlock.mutateAsync({ ...block, tagId });
            } else {
              await updateBlock.mutateAsync({ block, tagId });
            }
          }}
          onDelete={
            selectedBlock && findBlock(selectedBlock.id, queryClient)
              ? async (blockId) => await deleteBlockMutation.mutateAsync(blockId)
              : undefined
          }
          position={modalPosition ?? undefined}
        />
      )}

      {/* Add Task Modal */}
      {isAddTaskModalOpen && addTaskDate && (
        <AddTaskModal
          key={addTaskDate.toISOString()}
          isOpen={isAddTaskModalOpen}
          onClose={() => {
            setIsAddTaskModalOpen(false);
            setAddTaskDate(null);
          }}
          onSave={handleSaveTask}
          date={addTaskDate}
          tags={tags}
          weeklyGoals={weeklyGoals}
        />
      )}

      {/* Edit Task Modal */}
      {isEditTaskModalOpen && editingTask && (
        <AddTaskModal
          key={`edit-${editingTask.id}`}
          isOpen={isEditTaskModalOpen}
          onClose={() => {
            setIsEditTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleEditTask}
          onDelete={handleDeleteTask}
          onMoveToBacklog={handleMoveToBacklog}
          date={editingTask.date}
          tags={tags}
          weeklyGoals={weeklyGoals}
          task={editingTask}
        />
      )}
    </div>
  );
}

