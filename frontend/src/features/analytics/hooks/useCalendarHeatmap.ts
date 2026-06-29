'use client';

import { useMemo } from 'react';
import { getDaysInMonth, getFirstDayOfMonth } from '@/utils/dateUtils';
import type { HeatmapDay, CalendarDay } from '../types';

export function useCalendarHeatmap(
  month: number,
  year: number,
  heatmapData: HeatmapDay[]
): CalendarDay[] {
  return useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();
    const todayDay = today.getDate();

    const calendarDays: CalendarDay[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push({ day: null, isToday: false });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === todayDay;
      const heatmapEntry = heatmapData.find((d) => d.day === day);
      calendarDays.push({
        day,
        isToday,
        heatmapData: heatmapEntry,
      });
    }

    return calendarDays;
  }, [month, year, heatmapData]);
}

