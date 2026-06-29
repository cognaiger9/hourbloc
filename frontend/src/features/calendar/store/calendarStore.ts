'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ModalPosition } from '@/features/calendar/utils/modalPosition';
import { CalendarBlock } from '@/features/calendar/types/calendarBlock';

/**
 * Calendar Store - UI State Only
 *
 * This store manages only UI and interaction state.
 * All server state (blocks, tasks) is managed by React Query.
 * EXCEPT: Temp blocks (unsaved) live here until saved to server.
 */
interface CalendarState {
  // === UI State ===
  isModalOpen: boolean;
  modalPosition: ModalPosition | null;
  lastModalCloseTime: number; // Timestamp when modal was last closed
  selectedBlockId: string | null; // Changed from selectedBlock to just ID

  // === Temp Block (Unsaved) ===
  tempBlock: CalendarBlock | null; // Single temp block (only one exists at a time)

  // === Interaction State ===
  interactionState: 'idle' | 'pending' | 'dragging' | 'resizing';
  activeBlockId: string | null;
  pendingStartPos: { x: number; y: number } | null;
  dragPreview: { dayIndex: number; hour: number } | null;
  resizePreview: { startTime: number; endTime: number } | null;
  resizeEdge: 'top' | 'bottom' | null;
  lastInteractionEndTime: number; // Timestamp when interaction ended

  // === UI Actions ===
  selectBlock: (blockId: string | null, position?: ModalPosition) => void;
  closeModal: () => void;

  // === Temp Block Actions ===
  setTempBlock: (block: CalendarBlock | null) => void;
  updateTempBlock: (updates: Partial<CalendarBlock>) => void;
  clearTempBlock: () => void;

  // === Interaction Actions ===
  startInteraction: (blockId: string) => void;
  startPending: (blockId: string, position: { x: number; y: number }) => void;
  startDragging: () => void;
  startResizing: (blockId: string, edge: 'top' | 'bottom') => void;
  setInteractionState: (state: 'idle' | 'pending' | 'dragging' | 'resizing') => void;
  updateDragPreview: (preview: { dayIndex: number; hour: number } | null) => void;
  updateResizePreview: (preview: { startTime: number; endTime: number } | null, edge?: 'top' | 'bottom' | null) => void;
  cancelInteraction: () => void;
}

export const useCalendarStore = create<CalendarState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isModalOpen: false,
      modalPosition: null,
      lastModalCloseTime: 0,
      selectedBlockId: null,
      tempBlock: null,
      interactionState: 'idle',
      activeBlockId: null,
      pendingStartPos: null,
      dragPreview: null,
      resizePreview: null,
      resizeEdge: null,
      lastInteractionEndTime: 0,

      // UI actions
      selectBlock: (blockId, position) => {
        set(
          {
            selectedBlockId: blockId,
            isModalOpen: !!blockId,
            modalPosition: position ?? null,
          },
          false,
          'selectBlock'
        );
      },

      closeModal: () => {
        set(
          {
            isModalOpen: false,
            selectedBlockId: null,
            modalPosition: null,
            lastModalCloseTime: Date.now(),
          },
          false,
          'closeModal'
        );
      },

      // Temp block actions
      setTempBlock: (block) => {
        set({ tempBlock: block }, false, 'setTempBlock');
      },

      updateTempBlock: (updates) => {
        set(
          (state) => {
            if (!state.tempBlock) return state;
            return { tempBlock: { ...state.tempBlock, ...updates } };
          },
          false,
          'updateTempBlock'
        );
      },

      clearTempBlock: () => {
        set({ tempBlock: null }, false, 'clearTempBlock');
      },

      // Interaction actions
      startInteraction: (blockId) => {
        set({ activeBlockId: blockId }, false, 'startInteraction');
      },

      startPending: (blockId, position) => {
        set(
          {
            interactionState: 'pending',
            activeBlockId: blockId,
            pendingStartPos: position,
          },
          false,
          'startPending'
        );
      },

      startDragging: () => {
        set(
          {
            interactionState: 'dragging',
            pendingStartPos: null,
          },
          false,
          'startDragging'
        );
      },

      startResizing: (blockId, edge) => {
        set(
          {
            interactionState: 'resizing',
            activeBlockId: blockId,
            resizeEdge: edge,
            pendingStartPos: null,
          },
          false,
          'startResizing'
        );
      },

      setInteractionState: (state) => {
        set({ interactionState: state }, false, 'setInteractionState');
      },

      updateDragPreview: (preview) => {
        set({ dragPreview: preview }, false, 'updateDragPreview');
      },

      updateResizePreview: (preview, edge) => {
        set(
          {
            resizePreview: preview,
            resizeEdge: edge ?? null,
          },
          false,
          'updateResizePreview'
        );
      },

      cancelInteraction: () => {
        set(
          {
            interactionState: 'idle',
            activeBlockId: null,
            pendingStartPos: null,
            dragPreview: null,
            resizePreview: null,
            resizeEdge: null,
            lastInteractionEndTime: Date.now(),
          },
          false,
          'cancelInteraction'
        );
      },
    }),
    { name: 'calendar-store' }
  )
);
