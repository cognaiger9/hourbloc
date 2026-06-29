'use client';

import { useMemo, useRef, useLayoutEffect } from 'react';
import { getWeekDates, getMondayOfWeek } from '@/utils/dateUtils';
import { Tag } from '@/types/tag';
import DayHeaders from '@/features/calendar/components/DayHeaders';
import TimeSidebar from '@/features/calendar/components/TimeSidebar';
import CalendarGrid from '@/features/calendar/components/CalendarGrid';
import { useScrollSync } from '@/features/calendar/hooks/useScrollSync';
import { useCalendarInteraction } from '@/features/calendar/hooks/useCalendarInteraction';
import { useGridClick } from '@/features/calendar/hooks/useGridClick';
import { useBlocksQuery } from '@/features/calendar/hooks/useBlocks';
import { getMergedBlocks } from '@/features/calendar/utils/blockLookup';
import { useCalendarStore } from '@/features/calendar/store/calendarStore';

interface WeeklyCalendarViewProps {
  currentDate: Date;
  tags: Tag[];
  timezone: string;
}

export default function WeeklyCalendarView({ currentDate, tags, timezone }: WeeklyCalendarViewProps) {
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const timeSidebarRef = useRef<HTMLDivElement>(null);
  const gridColumnsRef = useRef<HTMLDivElement>(null);
  const gridAnimRef = useRef<HTMLDivElement>(null);
  const prevMondayRef = useRef<Date>(getMondayOfWeek(currentDate));

  // Get week dates
  const datesToShow = useMemo(() => getWeekDates(currentDate, 'week'), [currentDate]);

  // Slide grid columns in from the correct direction when navigating weeks
  useLayoutEffect(() => {
    const el = gridAnimRef.current;
    if (!el) return;
    const monday = getMondayOfWeek(currentDate);
    if (monday.getTime() === prevMondayRef.current.getTime()) return;
    const cls = monday > prevMondayRef.current ? 'nav-slide-forward' : 'nav-slide-backward';
    el.classList.add(cls);
    el.addEventListener('animationend', () => el.classList.remove(cls), { once: true });
    prevMondayRef.current = monday;
  }, [currentDate]);

  // Calculate date range for query (7 days before, 30 days ahead)
  const startDate = useMemo(() => {
    const start = new Date(datesToShow[0]);
    start.setDate(start.getDate() - 7);
    return start;
  }, [datesToShow]);

  const endDate = useMemo(() => {
    const end = new Date(datesToShow[datesToShow.length - 1]);
    end.setDate(end.getDate() + 30);
    return end;
  }, [datesToShow]);

  // Fetch saved blocks from React Query
  const { data: savedBlocks, isLoading } = useBlocksQuery(
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
  const blocks = useMemo(() => {
    return getMergedBlocks(savedBlocks || [], tempBlock);
  }, [savedBlocks, tempBlock]);

  // Scroll synchronization
  const { scrollPosition, handleTimeSidebarScroll, handleGridColumnsScroll } = useScrollSync('week');

  // Interaction handlers
  const { handleBlockMouseDown, isDragging, isResizing } = useCalendarInteraction({
    gridColumnsRef,
    gridContainerRef,
    datesToShow,
    blocks: blocks || [],
    tags,
    timezone,
  });

  // Grid click handler
  const { handleGridClick } = useGridClick({
    gridColumnsRef,
    gridContainerRef,
    datesToShow,
    isDragging,
    isResizing,
    blocks: blocks || [],
    tags,
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden" ref={gridContainerRef}>
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <DayHeaders dates={datesToShow} viewMode="week" />

        {/* Scrollable Grid Body */}
        <div className="flex-1 flex overflow-hidden relative bg-surface">
          <TimeSidebar
            ref={timeSidebarRef}
            onScroll={handleTimeSidebarScroll}
            scrollTop={scrollPosition}
          />

          <div ref={gridAnimRef} className="flex-1 relative overflow-hidden">
            <CalendarGrid
              ref={gridColumnsRef}
              dates={datesToShow}
              blocks={blocks || []}
              viewMode="week"
              onGridClick={handleGridClick}
              onBlockInteractionStart={handleBlockMouseDown}
              gridContainerRef={gridContainerRef}
              onScroll={handleGridColumnsScroll}
              scrollTop={scrollPosition}
              tags={tags}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
