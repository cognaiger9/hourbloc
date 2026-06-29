import { CalendarBlock } from '@/features/calendar/types/calendarBlock';
import { clamp } from '@/utils/common';
import { isSameDay } from '@/utils/dateUtils';

/**
 * Calculate which day column was clicked based on X coordinate
 * @param x - X coordinate relative to container
 * @param containerWidth - Width of the container
 * @param dayCount - Number of day columns
 * @returns Day index (0-indexed) or null if invalid
 */
export const calculateClickedDay = (
  x: number,
  containerWidth: number,
  dayCount: number
): number | null => {
  // Validate x is within container bounds
  if (x < 0 || x > containerWidth) return null;
  
  // Calculate day width (each day column takes equal space)
  const dayWidth = containerWidth / dayCount;
  
  // Calculate which day column (0-indexed)
  const dayIndex = Math.floor(x / dayWidth);
  
  // Validate day index is within range
  if (dayIndex < 0 || dayIndex >= dayCount) return null;
  
  return dayIndex;
};

/**
 * Calculate which hour was clicked based on Y coordinate and scroll position
 * @param y - Y coordinate relative to the visible viewport of the scrollable container
 * @param scrollTop - Current scroll position (how many pixels scrolled from top)
 * @returns Hour (0-23) or null if invalid
 */
export const calculateClickedHour = (
  y: number,
  scrollTop: number
): number | null => {
  // Calculate absolute Y position in the full 1440px grid
  // y is relative to the visible viewport, scrollTop tells us how far we've scrolled
  const absoluteY = y + scrollTop;
  
  // Each hour is 60px tall, calculate which hour (0-23)
  // Clamp to valid range to handle edge cases
  const hour = clamp(Math.floor(absoluteY / 60), 0, 23);
  
  // Validate hour is within valid range (0-23)
  if (hour < 0 || hour >= 24) return null;
  
  return hour;
};

/**
 * Calculate drag position with 15-minute interval snapping
 * @param x - X coordinate relative to container
 * @param y - Y coordinate relative to visible viewport
 * @param scrollTop - Current scroll position
 * @param containerWidth - Width of the container
 * @param dayCount - Number of day columns
 * @returns Object with dayIndex and hour (with 15-minute precision) or null if invalid
 */
export const calculateDragPosition = (
  x: number,
  y: number,
  scrollTop: number,
  containerWidth: number,
  dayCount: number
): { dayIndex: number; hour: number } | null => {
  // Calculate day index
  const dayIndex = calculateClickedDay(x, containerWidth, dayCount);
  if (dayIndex === null) return null;

  // Calculate absolute Y position in the full 1440px grid
  const absoluteY = y + scrollTop;
  
  // Each hour is 60px tall, calculate fractional hour
  const fractionalHour = absoluteY / 60;
  
  // Clamp to valid range (0-24)
  const clampedHour = Math.max(0, Math.min(24, fractionalHour));
  
  // Snap to 15-minute intervals (0, 0.25, 0.5, 0.75)
  const snappedHour = Math.round(clampedHour * 4) / 4;
  
  // Ensure we don't exceed 24 hours (snap to 23.75 max)
  const finalHour = Math.min(23.75, snappedHour);
  
  return { dayIndex, hour: finalHour };
};

/**
 * Find a calendar block at a specific date and hour position
 * @param date - The date to search for
 * @param hour - The hour to check (0-23)
 * @param blocks - Array of calendar blocks to search
 * @returns The block at the position or null if none found
 */
export const findBlockAtPosition = (
  date: Date,
  hour: number,
  blocks: CalendarBlock[]
): CalendarBlock | null => {
  // Filter blocks for the clicked date
  const blocksForDate = blocks.filter((block) => isSameDay(block.date, date));
  
  // Find block where the clicked hour falls within its time range
  // Check if hour is >= startTime and < endTime
  const clickedBlock = blocksForDate.find((block) => {
    const blockStart = block.startTime;
    const blockEnd = block.endTime;
    
    // Hour falls within block's time range (inclusive start, exclusive end)
    return hour >= blockStart && hour < blockEnd;
  });
  
  return clickedBlock || null;
};

/**
 * Check if two blocks overlap in time
 * @param block1 - First block to check
 * @param block2 - Second block to check
 * @returns True if blocks overlap, false otherwise
 */
export const checkBlockOverlap = (
  block1: CalendarBlock,
  block2: CalendarBlock
): boolean => {
  // Blocks on different days don't overlap
  if (!isSameDay(block1.date, block2.date)) {
    return false;
  }

  // Check if time ranges overlap
  // Two ranges overlap if: start1 < end2 && start2 < end1
  return block1.startTime < block2.endTime && block2.startTime < block1.endTime;
};

/**
 * Find the nearest non-overlapping position for a block
 * @param targetDate - Target date for the block
 * @param targetStartTime - Target start time (with 15-minute precision)
 * @param blockDuration - Duration of the block in hours
 * @param draggedBlockId - ID of the block being dragged (to exclude from overlap checks)
 * @param allBlocks - All existing blocks to check against
 * @returns Adjusted position { date: Date, startTime: number } or null if no valid position found
 */
export const findNearestNonOverlappingPosition = (
  targetDate: Date,
  targetStartTime: number,
  blockDuration: number,
  draggedBlockId: string,
  allBlocks: CalendarBlock[]
): { date: Date; startTime: number } | null => {
  // Create a temporary block for overlap checking
  const tempBlock: CalendarBlock = {
    id: draggedBlockId,
    date: new Date(targetDate),
    startTime: targetStartTime,
    endTime: targetStartTime + blockDuration,
    title: '',
    description: '',
    tag: 'Other',
  };

  // Filter blocks on the same day, excluding the dragged block
  const sameDayBlocks = allBlocks.filter(
    (block) => isSameDay(block.date, targetDate) && block.id !== draggedBlockId
  );

  // Check if the target position is valid (no overlaps and doesn't extend past midnight)
  const hasOverlap = sameDayBlocks.some((block) =>
    checkBlockOverlap(tempBlock, block)
  );

  if (!hasOverlap) {
    // Check bounds: startTime must be >= 0 and endTime must be <= 24
    // Don't allow blocks that extend past midnight
    if (targetStartTime >= 0 && targetStartTime + blockDuration <= 24) {
      return { date: new Date(targetDate), startTime: targetStartTime };
    }
  }

  // Search for nearest valid position
  // Try positions above (earlier) first, then below (later)
  const searchRange = 24; // Search up to 24 hours in each direction
  const step = 0.25; // 15-minute intervals

  // Search upward (earlier times)
  for (let offset = step; offset <= searchRange; offset += step) {
    const testStartTime = targetStartTime - offset;
    if (testStartTime < 0) break;

    const testEndTime = testStartTime + blockDuration;
    // Don't allow positions that extend past midnight
    if (testEndTime > 24) continue;

    const testBlock: CalendarBlock = {
      ...tempBlock,
      startTime: testStartTime,
      endTime: testEndTime,
    };

    const testHasOverlap = sameDayBlocks.some((block) =>
      checkBlockOverlap(testBlock, block)
    );

    if (!testHasOverlap) {
      return { date: new Date(targetDate), startTime: testStartTime };
    }
  }

  // Search downward (later times)
  for (let offset = step; offset <= searchRange; offset += step) {
    const testStartTime = targetStartTime + offset;
    const testEndTime = testStartTime + blockDuration;
    // Don't allow positions that extend past midnight
    if (testEndTime > 24) break;

    const testBlock: CalendarBlock = {
      ...tempBlock,
      startTime: testStartTime,
      endTime: testEndTime,
    };

    const testHasOverlap = sameDayBlocks.some((block) =>
      checkBlockOverlap(testBlock, block)
    );

    if (!testHasOverlap) {
      return { date: new Date(targetDate), startTime: testStartTime };
    }
  }

  // No valid position found
  return null;
};

/**
 * Calculate resize time from mouse Y position with 15-minute snapping
 * @param y - Y coordinate relative to visible viewport
 * @param scrollTop - Current scroll position
 * @returns Time in hours (0-24) snapped to 15-minute intervals, or null if invalid
 */
export const calculateResizeTime = (
  y: number,
  scrollTop: number
): number | null => {
  // Calculate absolute Y position in the full 1440px grid
  const absoluteY = y + scrollTop;
  
  // Each hour is 60px tall, calculate fractional hour
  const fractionalHour = absoluteY / 60;
  
  // Clamp to valid range (0-24)
  const clampedHour = clamp(fractionalHour, 0, 24);
  
  // Snap to 15-minute intervals (0, 0.25, 0.5, 0.75)
  const snappedHour = Math.round(clampedHour * 4) / 4;
  
  // Ensure we don't exceed 24 hours (snap to 23.75 max)
  const finalHour = Math.min(23.75, snappedHour);
  
  // Validate hour is within valid range (0-24)
  if (finalHour < 0 || finalHour > 24) return null;
  
  return finalHour;
};

/**
 * Check if a resized block would overlap with other blocks
 * @param block - The block being resized
 * @param newStartTime - New start time (if resizing top edge)
 * @param newEndTime - New end time (if resizing bottom edge)
 * @param allBlocks - All existing blocks to check against
 * @returns True if there's an overlap, false otherwise
 */
export const checkResizeOverlap = (
  block: CalendarBlock,
  newStartTime: number | null,
  newEndTime: number | null,
  allBlocks: CalendarBlock[]
): boolean => {
  const startTime = newStartTime !== null ? newStartTime : block.startTime;
  const endTime = newEndTime !== null ? newEndTime : block.endTime;
  
  // Ensure minimum duration of 15 minutes
  if (endTime - startTime < 0.25) {
    return true; // Invalid resize (too short)
  }
  
  // Check bounds
  if (startTime < 0 || endTime > 24) {
    return true; // Invalid resize (out of bounds)
  }
  
  // Filter blocks on the same day, excluding the resized block
  const sameDayBlocks = allBlocks.filter(
    (b) => isSameDay(b.date, block.date) && b.id !== block.id
  );
  
  // Create temporary block with new times
  const tempBlock: CalendarBlock = {
    ...block,
    startTime,
    endTime,
  };
  
  // Check for overlaps
  return sameDayBlocks.some((b) => checkBlockOverlap(tempBlock, b));
};

/**
 * Find valid resize time that doesn't overlap with other blocks
 * @param block - The block being resized
 * @param targetTime - Target time (from mouse position)
 * @param resizeEdge - Which edge is being resized ('top' or 'bottom')
 * @param allBlocks - All existing blocks to check against
 * @returns Valid resize times { startTime, endTime } or null if no valid position found
 */
export const findValidResizeTime = (
  block: CalendarBlock,
  targetTime: number,
  resizeEdge: 'top' | 'bottom',
  allBlocks: CalendarBlock[]
): { startTime: number; endTime: number } | null => {
  const minDuration = 0.25; // 15 minutes minimum
  
  let newStartTime: number;
  let newEndTime: number;
  
  if (resizeEdge === 'top') {
    // Resizing top edge: adjust startTime, KEEP END TIME FIXED (stretch/shrink from top)
    newStartTime = targetTime;
    newEndTime = block.endTime; // Keep endTime fixed - this is the key!
    
    // Ensure minimum duration (if startTime gets too close to endTime)
    if (newEndTime - newStartTime < minDuration) {
      newStartTime = newEndTime - minDuration;
    }
    
    // Clamp to bounds
    if (newStartTime < 0) {
      newStartTime = 0;
    }
    // EndTime is already fixed, no need to clamp it
  } else {
    // Resizing bottom edge: adjust endTime, KEEP START TIME FIXED (stretch/shrink from bottom)
    newEndTime = targetTime;
    newStartTime = block.startTime; // Keep startTime fixed
    
    // Ensure minimum duration (if endTime gets too close to startTime)
    if (newEndTime - newStartTime < minDuration) {
      newEndTime = newStartTime + minDuration;
    }
    
    // Clamp to bounds
    if (newEndTime > 24) {
      newEndTime = 24;
    }
    // StartTime is already fixed, no need to clamp it
  }
  
  // Check if this position is valid (no overlaps)
  if (!checkResizeOverlap(block, newStartTime, newEndTime, allBlocks)) {
    return { startTime: newStartTime, endTime: newEndTime };
  }
  
  // Search for nearest valid position
  const step = 0.25; // 15-minute intervals
  const searchRange = 24; // Search up to 24 hours
  
  if (resizeEdge === 'top') {
    // Search upward (earlier start times) - keep endTime fixed
    for (let offset = step; offset <= searchRange; offset += step) {
      const testStartTime = newStartTime - offset;
      if (testStartTime < 0) break;
      
      // Keep endTime fixed at block.endTime
      const testEndTime = block.endTime;
      if (testEndTime - testStartTime < minDuration) break;
      
      if (!checkResizeOverlap(block, testStartTime, testEndTime, allBlocks)) {
        return { startTime: testStartTime, endTime: testEndTime };
      }
    }
    
    // Search downward (later start times) - keep endTime fixed
    for (let offset = step; offset <= searchRange; offset += step) {
      const testStartTime = newStartTime + offset;
      const testEndTime = block.endTime; // Keep endTime fixed
      if (testEndTime - testStartTime < minDuration) break;
      
      if (!checkResizeOverlap(block, testStartTime, testEndTime, allBlocks)) {
        return { startTime: testStartTime, endTime: testEndTime };
      }
    }
  } else {
    // Resizing bottom edge: search upward (earlier end times) - keep startTime fixed
    for (let offset = step; offset <= searchRange; offset += step) {
      const testEndTime = newEndTime - offset;
      if (testEndTime - newStartTime < minDuration) break;
      
      if (!checkResizeOverlap(block, newStartTime, testEndTime, allBlocks)) {
        return { startTime: newStartTime, endTime: testEndTime };
      }
    }
    
    // Search downward (later end times) - keep startTime fixed
    for (let offset = step; offset <= searchRange; offset += step) {
      const testEndTime = newEndTime + offset;
      if (testEndTime > 24) break;
      
      if (!checkResizeOverlap(block, newStartTime, testEndTime, allBlocks)) {
        return { startTime: newStartTime, endTime: testEndTime };
      }
    }
  }
  
  // No valid position found
  return null;
};

