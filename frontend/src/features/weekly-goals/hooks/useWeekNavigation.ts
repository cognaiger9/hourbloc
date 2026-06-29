'use client';

import { useState, useEffect } from 'react';
import {
  getToday,
  getInitialMondayDate,
  getWeekDates,
  isViewingToday,
  getTodayDateForView
} from '@/utils/dateUtils';

/**
 * Hook for navigating between weeks in the Weekly Goals page
 */
export function useWeekNavigation() {
  const [currentDate, setCurrentDate] = useState(() => {
    return getInitialMondayDate();
  });

  const datesToShow = getWeekDates(currentDate, 'week');

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
        const datesToShow = getWeekDates(currentDate, 'week');
        const isCurrentlyViewingToday = isViewingToday(currentDate, 'week', datesToShow);

        if (isCurrentlyViewingToday) {
          // If viewing today, navigate to the new today
          setCurrentDate(getTodayDateForView('week'));
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
  }, [currentDate]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(getTodayDateForView('week'));
  };

  const isCurrentlyViewingToday = isViewingToday(currentDate, 'week', datesToShow);

  return {
    currentDate,
    datesToShow,
    navigateWeek,
    goToToday,
    isCurrentlyViewingToday,
  };
}
