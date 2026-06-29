'use client';

import { useState, useEffect, useMemo } from 'react';
import { getToday, isToday as isTodayUtil } from '@/utils/dateUtils';
import { trackReviewEvent } from '@/utils/analytics/reviewEvents';

/**
 * Hook for managing date navigation in the review page
 * Handles date state, midnight auto-updates, and navigation functions
 */
export function useDateNavigation() {
  const [currentDate, setCurrentDate] = useState(() => getToday());

  // Compute if current date is today
  const isToday = useMemo(() => {
    return isTodayUtil(currentDate);
  }, [currentDate]);

  // Auto-update at midnight
  useEffect(() => {
    const setupMidnightUpdate = () => {
      const now = getToday();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const milliseconds = now.getMilliseconds();

      const msUntilMidnight =
        24 * 60 * 60 * 1000 -
        (hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000 + milliseconds);

      const timeoutId = setTimeout(() => {
        setCurrentDate(getToday());
        setupMidnightUpdate();
      }, msUntilMidnight);

      return timeoutId;
    };

    const timeoutId = setupMidnightUpdate();
    return () => clearTimeout(timeoutId);
  }, []);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
    trackReviewEvent.dateNavigated(direction);
  };

  const goToToday = () => {
    setCurrentDate(getToday());
    trackReviewEvent.dateNavigated('today');
  };

  return {
    currentDate,
    isToday,
    navigateDate,
    goToToday,
  };
}
