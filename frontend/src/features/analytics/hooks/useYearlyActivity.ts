'use client';

import { useMemo } from 'react';
import type { MonthlyActivityBase, MonthData } from '../types';

/**
 * Hook to transform monthly activity data into the format needed by the heatmap
 * Converts dailyActivity object to Map for efficient lookups
 */
export function useYearlyActivity(
  year: number,
  monthlyActivityBase: MonthlyActivityBase[]
): MonthData[] {
  return useMemo(() => {
    return monthlyActivityBase.map((month) => ({
      month: month.month,
      hours: month.hours,
      year: year,
      monthIndex: month.monthIndex,
      activity: new Map(Object.entries(month.dailyActivity || {})), // Convert object to Map
    }));
  }, [year, monthlyActivityBase]);
}

