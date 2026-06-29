'use client';

import { useState, useEffect } from 'react';
import {
  getToday,
  getWeekDates,
  isViewingToday,
  getTodayDateForView,
} from '@/utils/dateUtils';

export function useCalendarNavigation() {
  const [currentDate, setCurrentDate] = useState(() => {
    // Initialize with today's date (not Monday)
    // Week view will automatically use Monday through getWeekDates
    return getToday();
  });
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  const datesToShow = getWeekDates(currentDate, viewMode);

  // Auto-update at midnight
  useEffect(() => {
    const setupMidnightUpdate = () => {
      const now = getToday();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const milliseconds = now.getMilliseconds();

      // Calculate milliseconds until next midnight
      const msUntilMidnight =
        24 * 60 * 60 * 1000 -
        (hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000 + milliseconds);

      const timeoutId = setTimeout(() => {
        // Check if we're viewing today
        const datesToShow = getWeekDates(currentDate, viewMode);
        const isCurrentlyViewingToday = isViewingToday(currentDate, viewMode, datesToShow);

        if (isCurrentlyViewingToday) {
          // If viewing today, navigate to the new today
          setCurrentDate(getTodayDateForView(viewMode));
        }

        // Set up next midnight check
        setupMidnightUpdate();
      }, msUntilMidnight);

      return timeoutId;
    };

    const timeoutId = setupMidnightUpdate();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [viewMode, currentDate]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const increment = viewMode === 'day' ? 1 : 7;
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? increment : -increment));
    setCurrentDate(newDate);
  };

  const goToToday = (overrideViewMode?: 'week' | 'day') => {
    const effectiveViewMode = overrideViewMode ?? viewMode;
    setCurrentDate(getTodayDateForView(effectiveViewMode));
  };

  // Day-specific navigation (always navigates by day, regardless of viewMode)
  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  return {
    currentDate,
    viewMode,
    datesToShow,
    navigateDate,
    navigateDay,
    goToToday,
  };
}

