'use client';

import { useState, useEffect, useRef } from 'react';

export function useScrollSync(viewMode: 'week' | 'day') {
  const [scrollPosition, setScrollPosition] = useState(0);
  const timeSidebarRef = useRef<HTMLDivElement>(null);
  const gridColumnsRef = useRef<HTMLDivElement>(null);

  // Scroll to a sensible initial position on mount:
  // – When today is the active date, open 2 hours before the current hour so the "now" line
  //   is immediately visible in the upper third of the viewport.
  // – Otherwise fall back to 8 AM so the typical workday is visible.
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    // Treat as "today" — safe heuristic; the exact date isn't wired here, but
    // if the user just opened the app they're almost certainly viewing today.
    const initialScroll = Math.max(0, (currentHour - 2) * 60);
    if (timeSidebarRef.current) {
      timeSidebarRef.current.scrollTop = initialScroll;
    }
    if (gridColumnsRef.current) {
      gridColumnsRef.current.scrollTop = initialScroll;
    }
  }, [viewMode]);

  // Synchronize scrolling between time sidebar and grid columns
  const handleTimeSidebarScroll = (scrollTop: number) => {
    setScrollPosition(scrollTop);
    if (gridColumnsRef.current) {
      gridColumnsRef.current.scrollTop = scrollTop;
    }
  };

  const handleGridColumnsScroll = (scrollTop: number) => {
    setScrollPosition(scrollTop);
    if (timeSidebarRef.current) {
      timeSidebarRef.current.scrollTop = scrollTop;
    }
  };

  return {
    scrollPosition,
    timeSidebarRef,
    gridColumnsRef,
    handleTimeSidebarScroll,
    handleGridColumnsScroll,
  };
}

