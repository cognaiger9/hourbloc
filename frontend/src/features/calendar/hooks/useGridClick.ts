'use client';

import { useRef, useCallback } from 'react';
import { CalendarBlock } from '@/features/calendar/types/calendarBlock';
import {
  calculateClickedDay,
  calculateClickedHour,
  findBlockAtPosition,
} from '@/features/calendar/utils/gridClick';
import { isSameDay } from '@/utils/dateUtils';
import {
  calculateModalPositionFromClick,
  calculateNewBlockBounds,
} from '@/features/calendar/utils/modalPosition';
import { useCalendarStore } from '@/features/calendar/store/calendarStore';
import { useDeleteBlockMutation } from '@/features/calendar/hooks/useBlocks';

interface UseGridClickProps {
  gridColumnsRef: React.RefObject<HTMLDivElement | null>;
  gridContainerRef: React.RefObject<HTMLDivElement | null>;
  datesToShow: Date[];
  isDragging: boolean;
  isResizing: boolean;
  blocks: CalendarBlock[]; // Now passed from React Query
  tags: Array<{ id: string; name: string }>;
}

const GRID_CLICK_DEBOUNCE_MS = 300; // Prevent rapid clicks from creating multiple blocks
const POST_INTERACTION_IGNORE_MS = 100; // Ignore clicks immediately after drag/resize ends
const POST_MODAL_CLOSE_IGNORE_MS = 100; // Ignore clicks immediately after modal closes

export function useGridClick({
  gridColumnsRef,
  gridContainerRef,
  datesToShow,
  isDragging,
  isResizing,
  blocks,
  tags,
}: UseGridClickProps) {
  const lastGridClickTimeRef = useRef<number>(0);

  // Get store state and actions (UI state only)
  const isModalOpen = useCalendarStore((state) => state.isModalOpen);
  const selectedBlockId = useCalendarStore((state) => state.selectedBlockId);
  const selectBlock = useCalendarStore((state) => state.selectBlock);
  const closeModal = useCalendarStore((state) => state.closeModal);
  const setTempBlock = useCalendarStore((state) => state.setTempBlock);
  const clearTempBlock = useCalendarStore((state) => state.clearTempBlock);

  // Get selected block from blocks array using selectedBlockId
  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;

  // React Query mutations
  const deleteBlockMutation = useDeleteBlockMutation();

  // Handle grid click to create new block
  const handleGridClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Debounce grid clicks to prevent double-clicks from creating duplicate blocks
    const now = Date.now();
    if (now - lastGridClickTimeRef.current < GRID_CLICK_DEBOUNCE_MS) {
      console.log('Ignoring rapid grid click (debounced)');
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    lastGridClickTimeRef.current = now;

    // Check store state directly for most current values
    const store = useCalendarStore.getState();
    
    // Ignore clicks that happen immediately after an interaction ends
    // This prevents creating a new block when a drag/resize just finished
    if (now - store.lastInteractionEndTime < POST_INTERACTION_IGNORE_MS) {
      console.log('Ignoring grid click immediately after interaction');
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Ignore clicks that happen immediately after modal closes
    // This prevents creating a new block when clicking outside modal to close it
    if (now - store.lastModalCloseTime < POST_MODAL_CLOSE_IGNORE_MS) {
      console.log('Ignoring grid click immediately after modal close');
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Don't handle grid clicks if we're dragging or resizing
    // Also check if the click target is a block (should be handled by block's onInteractionStart)
    const target = e.target as HTMLElement;
    const isClickingOnBlock = target.closest('[data-calendar-block]') !== null;

    // Check if clicking on the modal or its children
    const isClickingOnModal = target.closest('[data-block-modal]') !== null;

    // If clicking on the modal, don't handle grid click
    if (isClickingOnModal) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Check for active interaction (check both props AND store for safety)
    const isCurrentlyInteracting = store.interactionState !== 'idle';
    if (isDragging || isResizing || isClickingOnBlock || isCurrentlyInteracting) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Early return if grid container ref is not available
    if (!gridContainerRef.current || !gridColumnsRef.current) return;

    // Get scroll container bounding rectangle for coordinate calculations
    const scrollContainerRect = gridColumnsRef.current.getBoundingClientRect();

    // Calculate click coordinates relative to scroll container viewport
    const x = e.clientX - scrollContainerRect.left;
    const y = e.clientY - scrollContainerRect.top;

    // Validate click is within scroll container bounds
    if (x < 0 || x > scrollContainerRect.width || y < 0 || y > scrollContainerRect.height) {
      return;
    }

    // Calculate which day column was clicked
    const dayIndex = calculateClickedDay(x, scrollContainerRect.width, datesToShow.length);
    if (dayIndex === null) return;

    const clickedDate = datesToShow[dayIndex];

    // Calculate which hour was clicked (accounting for scroll position)
    // y is relative to the visible viewport, scrollTop tells us how far scrolled
    const scrollTop = gridColumnsRef.current.scrollTop;
    const hour = calculateClickedHour(y, scrollTop);
    if (hour === null) return;

    // Check if clicking on an existing block
    // Defensive check: ensure blocks is always an array
    const safeBlocks = Array.isArray(blocks) ? blocks : [];
    const visibleBlocks = safeBlocks.filter((block) => {
      return datesToShow.some((date) => isSameDay(block.date, date));
    });
    const clickedBlock = findBlockAtPosition(clickedDate, hour, visibleBlocks);

    if (clickedBlock) {
      // Find the block element to get its bounds
      const blockElement = document.querySelector(`[data-calendar-block="${clickedBlock.id}"]`) as HTMLElement;
      const position = calculateModalPositionFromClick(e.clientX, e.clientY, blockElement);
      selectBlock(clickedBlock.id, position);
    } else {
      // Check if there's an open modal with an unsaved block that needs to be closed first
      const hasUnsavedBlock = isModalOpen && selectedBlock && (selectedBlock.isNewlyCreated || selectedBlock.id.startsWith('temp-'));

      // Function to create the new block
      const createNewBlock = () => {
        // Create new block and add it immediately to the calendar
        // Use first tag from database, or fallback to empty string if no tags exist
        const defaultTag = tags.length > 0 ? tags[0].name : '';

        // Normalize date to ensure it's just the date part (no time component)
        // Clone the date to avoid mutating the original
        const normalizedDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate());

        const newBlock: CalendarBlock = {
          id: `temp-${crypto.randomUUID()}`, // Use temp ID until synced to backend
          date: normalizedDate,
          startTime: hour,
          endTime: hour + 1,
          title: '',
          description: '',
          tag: defaultTag,
          isNewlyCreated: true, // Mark as newly created
        };

        // Add temp block to STORE ONLY (not cache)
        // Store owns unsaved blocks until they're persisted
        setTempBlock(newBlock);

        // Calculate block bounds for newly created block
        const blockBounds = calculateNewBlockBounds(newBlock, datesToShow, gridColumnsRef);

        // Set modal position with calculated block bounds
        if (blockBounds) {
          selectBlock(newBlock.id, {
            x: e.clientX,
            y: e.clientY,
            blockBounds,
          });
        } else {
          // Fallback: use click position without block bounds
          selectBlock(newBlock.id, {
            x: e.clientX,
            y: e.clientY,
          });
        }
      };
      
      if (hasUnsavedBlock && selectedBlock) {
        // Close existing modal and clean up unsaved block first
        closeModal();

        // Check if it's a temp block or a saved block
        if (selectedBlock.id.startsWith('temp-')) {
          // Temp block: clear from store (no API call needed)
          clearTempBlock();
          // Small delay to ensure modal close animation completes
          setTimeout(() => {
            createNewBlock();
          }, 50);
        } else {
          // Saved block: delete using mutation
          deleteBlockMutation
            .mutateAsync(selectedBlock.id)
            .then(() => {
              setTimeout(() => {
                createNewBlock();
              }, 50);
            })
            .catch((error) => {
              console.error('Error deleting unsaved block:', error);
              setTimeout(() => {
                createNewBlock();
              }, 50);
            });
        }
      } else {
        // No unsaved block to close, create new block immediately
        createNewBlock();
      }
    }
  }, [
    blocks,
    datesToShow,
    gridColumnsRef,
    gridContainerRef,
    isDragging,
    isResizing,
    tags,
    isModalOpen,
    selectedBlock,
    selectBlock,
    closeModal,
    setTempBlock,
    clearTempBlock,
    deleteBlockMutation,
  ]);

  return {
    handleGridClick,
  };
}
