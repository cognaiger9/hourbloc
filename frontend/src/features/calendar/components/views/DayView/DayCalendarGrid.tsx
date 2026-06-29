'use client';

import { useRef, useMemo } from 'react';
import CalendarGrid from '@/features/calendar/components/CalendarGrid';
import TimeSidebar from '@/features/calendar/components/TimeSidebar';
import { useScrollSync } from '@/features/calendar/hooks/useScrollSync';
import { useCalendarInteraction } from '@/features/calendar/hooks/useCalendarInteraction';
import { useGridClick } from '@/features/calendar/hooks/useGridClick';
import { useBlocksQuery } from '@/features/calendar/hooks/useBlocks';
import { getMergedBlocks } from '@/features/calendar/utils/blockLookup';
import { useCalendarStore } from '@/features/calendar/store/calendarStore';
import { getWeekDates, isSameDay } from '@/utils/dateUtils';
import { Tag } from '@/types/tag';
import { TaskBlueprint } from '@/features/calendar/types/taskBlueprint';

interface DayCalendarGridProps {
  date: Date;
  tags: Tag[];
  gridContainerRef: React.RefObject<HTMLDivElement | null>;
  timezone: string;
  onTaskDrop: (task: TaskBlueprint, targetTime: number) => void;
  draggedTaskId: string | null;
}

export default function DayCalendarGrid({
  date,
  tags,
  gridContainerRef,
  timezone,
  onTaskDrop,
  draggedTaskId,
}: DayCalendarGridProps) {
  const timeSidebarRef = useRef<HTMLDivElement>(null);
  const gridColumnsRef = useRef<HTMLDivElement>(null);

  // Fetch same range as WeeklyCalendarView (7 days before, 30 days after) for cache sharing
  const startDate = useMemo(() => {
    const weekDates = getWeekDates(date, 'week');
    const start = new Date(weekDates[0]);
    start.setDate(start.getDate() - 7);
    return start;
  }, [date]);

  const endDate = useMemo(() => {
    const weekDates = getWeekDates(date, 'week');
    const end = new Date(weekDates[weekDates.length - 1]);
    end.setDate(end.getDate() + 30);
    return end;
  }, [date]);

  // Fetch saved blocks from React Query
  const { data: savedBlocks = [] } = useBlocksQuery(
    {
      startDate,
      endDate,
      blockType: 'planned',
    },
    timezone
  );

  // Subscribe to tempBlock so component re-renders when it changes
  const tempBlock = useCalendarStore((state) => state.tempBlock);

  // Merge saved blocks with temp block (if exists)
  const allBlocks = useMemo(() => {
    return getMergedBlocks(savedBlocks, tempBlock);
  }, [savedBlocks, tempBlock]);

  // Filter blocks to only show current day
  const blocks = useMemo(
    () => allBlocks.filter((block) => isSameDay(block.date, date)),
    [allBlocks, date]
  );

  // Scroll synchronization
  const { scrollPosition, handleTimeSidebarScroll, handleGridColumnsScroll } = useScrollSync('day');

  // Interaction handlers
  const { handleBlockMouseDown, isDragging, isResizing } = useCalendarInteraction({
    gridColumnsRef,
    gridContainerRef,
    datesToShow: [date],
    blocks,
    tags,
    timezone,
  });

  // Grid click handler
  const { handleGridClick } = useGridClick({
    gridColumnsRef,
    gridContainerRef,
    datesToShow: [date],
    isDragging,
    isResizing,
    blocks,
    tags,
  });

  return (
    <main className="flex-1 bg-white overflow-y-auto relative h-full">
      <div className="flex h-full overflow-hidden relative bg-surface">
        <TimeSidebar ref={timeSidebarRef} onScroll={handleTimeSidebarScroll} scrollTop={scrollPosition} />
        <CalendarGrid
          ref={gridColumnsRef}
          dates={[date]}
          blocks={blocks}
          viewMode="day"
          onGridClick={handleGridClick}
          onBlockInteractionStart={handleBlockMouseDown}
          gridContainerRef={gridContainerRef}
          onScroll={handleGridColumnsScroll}
          scrollTop={scrollPosition}
          tags={tags}
          onTaskDrop={onTaskDrop}
          draggedTaskId={draggedTaskId}
        />
      </div>
    </main>
  );
}
