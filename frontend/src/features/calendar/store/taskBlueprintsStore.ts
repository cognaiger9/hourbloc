'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Task Blueprints Store - UI State Only
 *
 * This store manages only UI state (selection).
 * All server state (tasks) is managed by React Query.
 */
interface TaskBlueprintsState {
  // === UI State ===
  selectedTaskId: string | null; // Changed from selectedTask to just ID

  // === UI Actions ===
  selectTask: (taskId: string | null) => void;
}

export const useTaskBlueprintsStore = create<TaskBlueprintsState>()(
  devtools(
    (set) => ({
      // Initial state
      selectedTaskId: null,

      // UI actions
      selectTask: (taskId) => {
        set({ selectedTaskId: taskId }, false, 'selectTask');
      },
    }),
    { name: 'task-blueprints-store' }
  )
);
