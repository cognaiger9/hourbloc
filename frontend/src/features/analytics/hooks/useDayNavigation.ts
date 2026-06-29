'use client';

import { useState } from 'react';
import { getToday, isToday, getTodayDateForView, formatDateRange } from '@/utils/dateUtils';

export function useDayNavigation(initialDate?: Date) {
  const [currentDate, setCurrentDate] = useState(initialDate || getToday());

  const formatDateShort = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleGoToToday = () => {
    setCurrentDate(getTodayDateForView('day'));
  };

  const formattedDateRange = formatDateRange(currentDate, 'day');
  const formattedDateShort = formatDateShort(currentDate);
  const isCurrentDateToday = isToday(currentDate);

  return {
    currentDate,
    formattedDateRange,
    formattedDateShort,
    isCurrentDateToday,
    handlePreviousDay,
    handleNextDay,
    handleGoToToday,
  };
}

