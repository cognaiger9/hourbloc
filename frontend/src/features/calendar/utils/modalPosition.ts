import { CalendarBlock } from '@/features/calendar/types/calendarBlock';
import { isSameDay } from '@/utils/dateUtils';
import { clamp } from '@/utils/common';

export interface ModalPosition {
  x: number;
  y: number;
  blockBounds?: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

/**
 * Calculate modal position from block element
 */
export function calculateModalPositionFromBlock(
  block: CalendarBlock,
  datesToShow: Date[],
  gridColumnsRef: React.RefObject<HTMLDivElement | null>,
  gridContainerRef: React.RefObject<HTMLDivElement | null>
): ModalPosition | null {
  // Find the block element in the DOM to get its position
  const blockElement = document.querySelector(`[data-calendar-block="${block.id}"]`) as HTMLElement;
  
  if (blockElement) {
    const rect = blockElement.getBoundingClientRect();
    // Capture block bounds for collision detection
    const blockBounds = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
    // Position near the center-right of the block
    return {
      x: rect.right,
      y: rect.top + rect.height / 2,
      blockBounds,
    };
  }
  
  // Fallback: use block's calculated position
  const gridColsRef = gridColumnsRef.current;
  const gridContRef = gridContainerRef.current;
  if (gridContRef && gridColsRef) {
    const blockDateIndex = datesToShow.findIndex((date) => isSameDay(block.date, date));
    if (blockDateIndex !== -1) {
      const gridRect = gridColsRef.getBoundingClientRect();
      const dayWidth = gridRect.width / datesToShow.length;
      const left = gridRect.left + (blockDateIndex + 1) * dayWidth;
      const top = gridRect.top + block.startTime * 60 - gridColsRef.scrollTop + 30; // 30px offset
      // For fallback, we don't have block bounds, so don't pass them
      return { x: left, y: top };
    }
  }
  
  return null;
}

/**
 * Calculate modal position from click coordinates
 */
export function calculateModalPositionFromClick(
  clientX: number,
  clientY: number,
  blockElement?: HTMLElement | null
): ModalPosition {
  if (blockElement) {
    const rect = blockElement.getBoundingClientRect();
    const blockBounds = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
    return {
      x: clientX,
      y: clientY,
      blockBounds,
    };
  }
  
  return {
    x: clientX,
    y: clientY,
  };
}

/**
 * Calculate block bounds for a newly created block
 */
export function calculateNewBlockBounds(
  block: CalendarBlock,
  datesToShow: Date[],
  gridColumnsRef: React.RefObject<HTMLDivElement | null>
): {
  left: number;
  top: number;
  width: number;
  height: number;
} | null {
  if (!gridColumnsRef.current) {
    return null;
  }
  
  const blockDateIndex = datesToShow.findIndex((date) => isSameDay(block.date, date));
  if (blockDateIndex === -1) {
    return null;
  }
  
  const gridScrollRect = gridColumnsRef.current.getBoundingClientRect();
  const scrollTop = gridColumnsRef.current.scrollTop;
  
  // Calculate block position (same logic as CalendarGrid)
  const leftPercent = (blockDateIndex / datesToShow.length) * 100;
  const widthPercent = 100 / datesToShow.length;
  const topPx = block.startTime * 60; // Absolute position in 1440px grid
  const heightPx = (block.endTime - block.startTime) * 60;
  
  // Convert to viewport coordinates
  // leftPercent is relative to grid container width
  const blockLeft = gridScrollRect.left + (gridScrollRect.width * leftPercent / 100);
  const blockWidth = gridScrollRect.width * widthPercent / 100;
  // topPx is absolute in the 1440px grid, need to account for scroll
  const blockTop = gridScrollRect.top + topPx - scrollTop;
  const blockHeight = heightPx;
  
  return {
    left: blockLeft,
    top: blockTop,
    width: blockWidth,
    height: blockHeight,
  };
}

export interface CalculatedModalPosition {
  top: number;
  left: number;
}

/**
 * Calculate optimal position for a modal/floating panel based on initial position and block bounds.
 * Handles viewport constraints and smart positioning (prefer right, fallback left, then center).
 * 
 * @param position - Initial position with optional block bounds
 * @param modalWidth - Width of the modal in pixels
 * @param modalHeight - Height of the modal in pixels
 * @param options - Optional configuration
 * @returns Calculated position with top and left coordinates, or null if position is invalid
 */
export function calculateOptimalModalPosition(
  position: ModalPosition,
  modalWidth: number,
  modalHeight: number,
  options: {
    padding?: number; // Padding from viewport edges (default: 16)
    gap?: number; // Minimum gap between modal and block (default: 12)
  } = {}
): CalculatedModalPosition | null {
  const { padding = 16, gap = 12 } = options;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const blockBounds = position.blockBounds;

  // Simplified positioning algorithm when block bounds are available
  if (blockBounds && blockBounds.left !== undefined && blockBounds.top !== undefined) {
    // Calculate right edge from left + width
    const blockRight = blockBounds.left + blockBounds.width;
    
    // Horizontal positioning: prefer right, fallback left, then center
    // Account for padding when calculating available space
    const spaceRight = viewportWidth - blockRight - padding;
    const spaceLeft = blockBounds.left - padding;
    
    let modalLeft: number;
    if (spaceRight >= modalWidth + gap) {
      // Position popup to the right of block: popup.x = block.right + gap
      modalLeft = blockRight + gap;
    } else if (spaceLeft >= modalWidth + gap) {
      // Position popup to the left of block: popup.x = block.left - gap - popup.width
      modalLeft = blockBounds.left - gap - modalWidth;
    } else {
      // Neither side works, center horizontally within viewport
      modalLeft = Math.max(padding, (viewportWidth - modalWidth) / 2);
    }

    // Ensure modal doesn't go outside viewport
    modalLeft = clamp(modalLeft, padding, viewportWidth - modalWidth - padding);

    // Vertical positioning: align top with block top, clamp to viewport
    // popup.y = block.top (align tops)
    let modalTop = blockBounds.top;
    // Clamp to viewport boundaries
    modalTop = clamp(modalTop, padding, viewportHeight - modalHeight - padding);

    return { left: modalLeft, top: modalTop };
  } else {
    // No block bounds (grid click) - use fallback positioning
    let left = position.x + gap;
    let top = position.y + gap;

    // Adjust if too close to right edge
    if (left + modalWidth > viewportWidth - padding) {
      left = position.x - modalWidth - gap;
      if (left < padding) {
        left = padding;
      }
    }

    // Adjust if too close to bottom edge
    if (top + modalHeight > viewportHeight - padding) {
      top = position.y - modalHeight - gap;
      if (top < padding) {
        top = padding;
      }
    }

    // Ensure minimum padding from edges
    if (left < padding) left = padding;
    if (top < padding) top = padding;

    return { left, top };
  }
}

