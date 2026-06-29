'use client';

import { useEffect, useCallback } from 'react';
import { useCalendarStore } from '../store/calendarStore';
import { CalendarBlock } from '../types/calendarBlock';
import {
  calculateDragPosition,
  calculateResizeTime,
  findValidResizeTime,
  findNearestNonOverlappingPosition,
} from '../utils/gridClick';
import { useUpdateBlockMutation, useCreateBlockMutation } from './useBlocks';
import { isTempBlock } from '../utils/blockLookup';

interface UseCalendarInteractionProps {
  gridColumnsRef: React.RefObject<HTMLDivElement | null>;
  gridContainerRef: React.RefObject<HTMLDivElement | null>;
  datesToShow: Date[];
  blocks: CalendarBlock[]; // Now passed from React Query
  tags: Array<{ id: string; name: string }>;
  timezone: string;
}

// Helper function to detect if mouse is on block edge
function detectBlockEdge(
  block: CalendarBlock,
  blockElement: HTMLElement,
  clientY: number
): 'top' | 'bottom' | null {
  const rect = blockElement.getBoundingClientRect();
  const relativeY = clientY - rect.top;
  const edgeThreshold = 6; // 6px threshold for edge detection

  // Check top edge - from -4px to 6px from the top
  if (relativeY >= -4 && relativeY <= edgeThreshold) {
    return 'top';
  }
  // Check bottom edge - from (height - 6px) to (height + 4px)
  if (relativeY >= rect.height - edgeThreshold && relativeY <= rect.height + 4) {
    return 'bottom';
  }
  return null;
}

const DRAG_THRESHOLD = 5; // pixels

export function useCalendarInteraction({
  gridColumnsRef,
  gridContainerRef,
  datesToShow,
  blocks,
  tags,
  timezone,
}: UseCalendarInteractionProps) {
  const {
    interactionState,
    activeBlockId,
    startPending,
    startDragging,
    startResizing,
    updateDragPreview,
    updateResizePreview,
    cancelInteraction,
    selectBlock,
  } = useCalendarStore();

  // Get mutations for updating blocks
  const updateBlock = useUpdateBlockMutation(timezone);
  const createBlock = useCreateBlockMutation(timezone);

  // Handle mouse events
  useEffect(() => {
    if (interactionState === 'idle') return;

    const handleMouseMove = (e: MouseEvent) => {
      const store = useCalendarStore.getState();
      const currentState = store.interactionState;
      const gridColsRef = gridColumnsRef.current;
      const gridContRef = gridContainerRef.current;

      if (!gridColsRef || !gridContRef) return;

      // Handle pending -> dragging transition (drag threshold detection)
      if (currentState === 'pending' && store.pendingStartPos) {
        const distance = Math.hypot(
          e.clientX - store.pendingStartPos.x,
          e.clientY - store.pendingStartPos.y
        );
        if (distance > DRAG_THRESHOLD) {
          startDragging();
          // Set grabbing cursor globally while dragging
          document.body.style.cursor = 'grabbing';
          // Continue to dragging logic below
        } else {
          return; // Still pending, don't update preview
        }
      }

      if (currentState === 'dragging') {
        const scrollContainerRect = gridColsRef.getBoundingClientRect();
        const x = e.clientX - scrollContainerRect.left;
        const y = e.clientY - scrollContainerRect.top;

        // Check if mouse is within grid bounds
        if (x < 0 || x > scrollContainerRect.width || y < 0 || y > scrollContainerRect.height) {
          return;
        }

        const scrollTop = gridColsRef.scrollTop;
        const dragPos = calculateDragPosition(
          x,
          y,
          scrollTop,
          scrollContainerRect.width,
          datesToShow.length
        );

        if (dragPos) {
          updateDragPreview(dragPos);
        }
      }

      if (currentState === 'resizing' && store.activeBlockId && store.resizeEdge) {
        const scrollContainerRect = gridColsRef.getBoundingClientRect();
        const y = e.clientY - scrollContainerRect.top;

        if (y < 0 || y > scrollContainerRect.height) {
          return;
        }

        const scrollTop = gridColsRef.scrollTop;
        const targetTime = calculateResizeTime(y, scrollTop);
        if (targetTime === null) return;

        const resizedBlock = blocks.find((b) => b.id === store.activeBlockId);
        if (!resizedBlock) {
          return;
        }

        const validResize = findValidResizeTime(resizedBlock, targetTime, store.resizeEdge, blocks);
        if (validResize) {
          updateResizePreview(validResize, store.resizeEdge);
        }
      }
    };

    const handleMouseUp = async () => {
      const store = useCalendarStore.getState();
      const currentState = store.interactionState;
      const gridColsRef = gridColumnsRef.current;

      // Capture all needed data BEFORE cancelling interaction
      const activeBlockId = store.activeBlockId;
      const dragPreviewValue = store.dragPreview;
      const resizePreviewValue = store.resizePreview;

      // Restore cursor
      document.body.style.cursor = '';

      // IMMEDIATELY cancel interaction to stop mouse move processing
      // This is the key fix - cancel FIRST, then do async work
      cancelInteraction();

      if (currentState === 'pending') {
        // Was a click, not a drag - open the block modal
        const clickedBlock = blocks.find((b) => b.id === activeBlockId);
        if (clickedBlock) {
          // Calculate modal position
          const blockElement = document.querySelector(`[data-calendar-block="${clickedBlock.id}"]`) as HTMLElement;
          if (blockElement && gridColsRef && gridContainerRef.current) {
            const rect = blockElement.getBoundingClientRect();
            selectBlock(clickedBlock.id, {
              x: rect.right,
              y: rect.top + rect.height / 2,
              blockBounds: {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
              },
            });
          } else {
            selectBlock(clickedBlock.id);
          }
        }
        return;
      }

      if (currentState === 'dragging') {
        // Commit drag
        if (dragPreviewValue && activeBlockId && gridColsRef) {
          const draggedBlock = blocks.find((b) => b.id === activeBlockId);
          if (draggedBlock) {
            const targetDate = datesToShow[dragPreviewValue.dayIndex];
            const duration = draggedBlock.endTime - draggedBlock.startTime;
            const targetStartTime = dragPreviewValue.hour;

            // Check for overlaps and auto-adjust if needed
            const adjustedPosition = findNearestNonOverlappingPosition(
              targetDate,
              targetStartTime,
              duration,
              activeBlockId,
              blocks
            );

            if (adjustedPosition) {
              // Calculate final end time - clamp to 24:00 if it would extend past midnight
              const finalEndTime = Math.min(24, adjustedPosition.startTime + duration);

              // If the block would extend past midnight, reject the drop
              if (adjustedPosition.startTime + duration <= 24) {
                const updatedBlock: CalendarBlock = {
                  ...draggedBlock,
                  date: adjustedPosition.date,
                  startTime: adjustedPosition.startTime,
                  endTime: finalEndTime,
                };

                // Handle temp blocks vs saved blocks differently
                if (isTempBlock(activeBlockId)) {
                  // Temp block: update store directly (no API call)
                  const store = useCalendarStore.getState();
                  store.updateTempBlock({
                    date: adjustedPosition.date,
                    startTime: adjustedPosition.startTime,
                    endTime: finalEndTime,
                  });
                } else {
                  // Saved block: use mutation
                  try {
                    const tag = tags.find((t) => t.name === updatedBlock.tag);
                    const tagId = tag?.id || null;
                    await updateBlock.mutateAsync({ block: updatedBlock, tagId });

                    // Update selected block if it's the one being dragged
                    const selectedBlockId = useCalendarStore.getState().selectedBlockId;
                    if (selectedBlockId === activeBlockId) {
                      const newBlock = blocks.find((b) => b.id === updatedBlock.id);
                      if (newBlock) {
                        useCalendarStore.getState().selectBlock(newBlock.id);
                      }
                    }
                  } catch (error) {
                    console.error('Error updating block during drag:', error);
                  }
                }
              }
            }
          }
        }
        return;
      }

      if (currentState === 'resizing') {
        // Commit resize
        if (resizePreviewValue && activeBlockId) {
          const resizedBlock = blocks.find((b) => b.id === activeBlockId);
          if (resizedBlock) {
            // Handle temp blocks vs saved blocks differently
            if (isTempBlock(activeBlockId)) {
              // Temp block: update store directly (no API call)
              const store = useCalendarStore.getState();
              store.updateTempBlock({
                startTime: resizePreviewValue.startTime,
                endTime: resizePreviewValue.endTime,
              });
            } else {
              // Saved block: use mutation
              const updatedBlock: CalendarBlock = {
                ...resizedBlock,
                startTime: resizePreviewValue.startTime,
                endTime: resizePreviewValue.endTime,
              };

              try {
                const tag = tags.find((t) => t.name === updatedBlock.tag);
                const tagId = tag?.id || null;
                await updateBlock.mutateAsync({ block: updatedBlock, tagId });

                // Update selected block if it's the one being resized
                const selectedBlockId = useCalendarStore.getState().selectedBlockId;
                if (selectedBlockId === activeBlockId) {
                  const newBlock = blocks.find((b) => b.id === updatedBlock.id);
                  if (newBlock) {
                    useCalendarStore.getState().selectBlock(newBlock.id);
                  }
                }
              } catch (error) {
                console.error('Error updating block during resize:', error);
              }
            }
          }
        }
        return;
      }
    };

    const handleSelectStart = (e: Event) => {
      const store = useCalendarStore.getState();
      if (store.interactionState !== 'idle') {
        e.preventDefault();
      }
    };

    const handleDragStart = (e: DragEvent) => {
      // Prevent browser's default drag behavior
      const store = useCalendarStore.getState();
      if (store.interactionState === 'resizing') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
      // Prevent browser drag for calendar blocks (we handle it manually)
      const target = e.target as HTMLElement;
      if (target?.closest('[data-calendar-block]')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    const handleDrag = (e: DragEvent) => {
      // Prevent browser's default drag behavior during resize
      const store = useCalendarStore.getState();
      if (store.interactionState === 'resizing') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Prevent browser drag for calendar blocks (we handle it manually)
      const target = e.target as HTMLElement;
      if (target?.closest('[data-calendar-block]')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener('selectstart', handleSelectStart, { capture: true });
    document.addEventListener('dragstart', handleDragStart, { capture: true });
    document.addEventListener('drag', handleDrag, { capture: true });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('selectstart', handleSelectStart, { capture: true });
      document.removeEventListener('dragstart', handleDragStart, { capture: true });
      document.removeEventListener('drag', handleDrag, { capture: true });
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [interactionState, datesToShow, blocks, tags, timezone, gridColumnsRef, gridContainerRef, updateDragPreview, updateResizePreview, cancelInteraction, selectBlock, startDragging, updateBlock, createBlock]);

  // Handler for block interaction start (called from CalendarBlockItem)
  const handleBlockMouseDown = useCallback(
    (blockId: string, element: HTMLElement, clientX: number, clientY: number) => {
      const block = blocks.find((b) => b.id === blockId);
      if (!block) return;

      // Detect edge before setting up interaction
      const edge = detectBlockEdge(block, element, clientY);

      if (edge) {
        // If edge is detected, set up resize
        startResizing(blockId, edge);
        // Set resize cursor globally
        document.body.style.cursor = 'ns-resize';

        // Set resize state
        updateResizePreview(null, edge);

        // Calculate initial resize position
        const gridColsRef = gridColumnsRef.current;
        if (gridColsRef) {
          const scrollContainerRect = gridColsRef.getBoundingClientRect();
          const y = clientY - scrollContainerRect.top;

          if (y >= 0 && y <= scrollContainerRect.height) {
            const scrollTop = gridColsRef.scrollTop;
            const targetTime = calculateResizeTime(y, scrollTop);

            if (targetTime !== null) {
              const validResize = findValidResizeTime(block, targetTime, edge, blocks);
              if (validResize) {
                updateResizePreview(validResize, edge);
              }
            }
          }
        }
      } else {
        // Not on edge - start pending (will transition to dragging if moved)
        startPending(blockId, { x: clientX, y: clientY });

        // Initialize drag preview to block's current position
        const blockDateIndex = datesToShow.findIndex((date) => {
          const isSame =
            date.getFullYear() === block.date.getFullYear() &&
            date.getMonth() === block.date.getMonth() &&
            date.getDate() === block.date.getDate();
          return isSame;
        });
        if (blockDateIndex !== -1) {
          updateDragPreview({ dayIndex: blockDateIndex, hour: block.startTime });
        }
      }
    },
    [blocks, datesToShow, gridColumnsRef, startPending, startResizing, updateDragPreview, updateResizePreview]
  );

  return {
    interactionState,
    handleBlockMouseDown,
    isDragging: interactionState === 'dragging',
    isResizing: interactionState === 'resizing',
    activeBlockId,
  };
}

