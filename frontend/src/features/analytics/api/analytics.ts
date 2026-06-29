/**
 * API methods for analytics data
 */

import { apiRequest } from '@/utils/api/client';
import type {
  DayAnalyticsData,
  WorkTimeByTag,
  TimelineBar,
  TodayData,
  LifetimeData,
  StreaksData,
  CalendarData,
  HeatmapDay
} from '../types';

/**
 * API response type from backend for day analytics
 */
interface DayAnalyticsApiResponse {
  date: string; // YYYY-MM-DD format
  totalWorkTime: string;
  totalBlocks: number;
  workTimeByTag: WorkTimeByTag[];
  plannedBars: TimelineBar[];
  actualBars: TimelineBar[];
}

/**
 * API response type from backend for overview analytics
 */
interface OverviewAnalyticsApiResponse {
  today: {
    date: string;
    workTime: string;
    blocks: number;
  };
  lifetime: {
    totalWorkTime: string;
    totalBlocks: number;
    workDays: number;
  };
  streaks: {
    currentStreak: number;
    bestStreak: number;
    message: string;
  };
  calendar: {
    month: number;
    year: number;
    daysWorked: number;
    totalDays: number;
    avgWorkDay: string;
    totalWork: string;
  };
  heatmap: HeatmapDay[];
}

/**
 * Get analytics for a specific day
 * @param date - Date object for the day to get analytics for
 * @returns DayAnalyticsData with analytics for the specified day
 */
export async function getDayAnalytics(date: Date): Promise<DayAnalyticsData> {
  // Format date as YYYY-MM-DD (in local timezone)
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  // Get timezone offset in minutes (negated because JS returns opposite sign)
  // Example: PST is UTC-8, JS returns 480, we need -480
  const timezoneOffset = -date.getTimezoneOffset();

  const response = await apiRequest<DayAnalyticsApiResponse>(
    `/api/v1/analytics/day?date=${dateStr}&timezone_offset=${timezoneOffset}`,
    {
      method: 'GET',
    }
  );

  // Calculate nowPosition if the date is today
  let nowPosition: number | undefined;
  const today = new Date();
  const isToday = 
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  
  if (isToday) {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    nowPosition = (totalMinutes / (24 * 60)) * 100;
  }

  // Convert date string to Date object
  return {
    date: new Date(date),
    totalWorkTime: response.totalWorkTime,
    totalBlocks: response.totalBlocks,
    workTimeByTag: response.workTimeByTag,
    plannedBars: response.plannedBars,
    actualBars: response.actualBars,
    nowPosition: nowPosition !== undefined ? round(nowPosition, 2) : undefined,
  };
}

function round(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * API response type from backend for week analytics
 */
interface WeekAnalyticsApiResponse {
  weekStart: string; // YYYY-MM-DD format
  weekEnd: string; // YYYY-MM-DD format
  totalWorkTime: string;
  previousWeekWorkTime: string;
  totalBlocks: number;
  workTimeByTag: WorkTimeByTag[];
  dailyData: Array<{
    dayName: string;
    date: string;
    fullDate: string; // YYYY-MM-DD format
    workTime: string;
    workTimeMinutes: number;
    tags: Array<{
      tag: string;
      minutes: number;
      color: string;
    }>;
  }>;
}

/**
 * Get analytics for a specific week
 * @param startDate - Week start date (should be a Monday)
 * @returns WeekAnalyticsData with analytics for the specified week
 */
export async function getWeekAnalytics(startDate: Date): Promise<import('../types').WeekAnalyticsData> {
  // Format date as YYYY-MM-DD (in local timezone)
  const dateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;

  // Get timezone offset in minutes (negated because JS returns opposite sign)
  const timezoneOffset = -startDate.getTimezoneOffset();

  const response = await apiRequest<WeekAnalyticsApiResponse>(
    `/api/v1/analytics/week?start_date=${dateStr}&timezone_offset=${timezoneOffset}`,
    {
      method: 'GET',
    }
  );

  return {
    weekStart: new Date(response.weekStart),
    weekEnd: new Date(response.weekEnd),
    totalWorkTime: response.totalWorkTime,
    previousWeekWorkTime: response.previousWeekWorkTime,
    totalBlocks: response.totalBlocks,
    workTimeByTag: response.workTimeByTag,
    dailyData: response.dailyData.map(day => ({
      ...day,
      fullDate: new Date(day.fullDate),
    })),
  };
}

/**
 * API response type from backend for year analytics
 */
interface YearAnalyticsApiResponse {
  year: number;
  summaryStats: Array<{
    label: string;
    value: string;
  }>;
  workTimeByTag: WorkTimeByTag[];
  monthlyActivityBase: Array<{
    month: string;
    hours: string;
    monthIndex: number;
    dailyActivity: Record<string, {
      hasActivity: boolean;
      workTime: string | null;
      blocks: number | null;
    }>;
  }>;
}

/**
 * Get analytics for a specific year
 * @param year - Year to get analytics for (e.g., 2025)
 * @returns YearAnalyticsData with analytics for the specified year
 */
export async function getYearAnalytics(year: number): Promise<import('../types').YearAnalyticsData> {
  // Get timezone offset in minutes (negated because JS returns opposite sign)
  const timezoneOffset = -new Date().getTimezoneOffset();

  const response = await apiRequest<YearAnalyticsApiResponse>(
    `/api/v1/analytics/year?year=${year}&timezone_offset=${timezoneOffset}`,
    {
      method: 'GET',
    }
  );

  // Import icons for summary stats
  const { Clock, Target, Calendar, TrendingUp, Award, Zap, BarChart3, Flame } = await import('lucide-react');

  // Map stat labels to icons
  const iconMap: Record<string, any> = {
    'Focus Time': Clock,
    'Sessions': Target,
    'Focus Days': Calendar,
    'Avg Session': TrendingUp,
    'Best Day': Award,
    'Best Week': Zap,
    'Best Month': BarChart3,
    'Best Streak': Flame,
  };

  return {
    year: response.year,
    summaryStats: response.summaryStats.map(stat => ({
      label: stat.label,
      value: stat.value,
      icon: iconMap[stat.label] || Clock,
    })),
    workTimeByTag: response.workTimeByTag,
    monthlyActivityBase: response.monthlyActivityBase,
  };
}

/**
 * Get overview analytics for the main analytics page
 * @param month - 0-indexed month (0-11)
 * @param year - Year (e.g., 2025)
 * @returns Object containing today's data, lifetime stats, streaks, calendar data, and heatmap
 */
export async function getOverviewAnalytics(
  month: number,
  year: number
): Promise<{
  todayData: TodayData;
  lifetimeData: LifetimeData;
  streaksData: StreaksData;
  calendarData: CalendarData;
  heatmapData: HeatmapDay[];
}> {
  // Get timezone offset in minutes (negated because JS returns opposite sign)
  const timezoneOffset = -new Date().getTimezoneOffset();

  const response = await apiRequest<OverviewAnalyticsApiResponse>(
    `/api/v1/analytics/overview?month=${month}&year=${year}&timezone_offset=${timezoneOffset}`,
    {
      method: 'GET',
    }
  );

  return {
    todayData: {
      date: new Date(response.today.date),
      workTime: response.today.workTime,
      blocks: response.today.blocks,
    },
    lifetimeData: {
      totalWorkTime: response.lifetime.totalWorkTime,
      totalBlocks: response.lifetime.totalBlocks,
      workDays: response.lifetime.workDays,
    },
    streaksData: {
      currentStreak: response.streaks.currentStreak,
      bestStreak: response.streaks.bestStreak,
      message: response.streaks.message,
    },
    calendarData: {
      month: response.calendar.month,
      year: response.calendar.year,
      daysWorked: response.calendar.daysWorked,
      totalDays: response.calendar.totalDays,
      avgWorkDay: response.calendar.avgWorkDay,
      totalWork: response.calendar.totalWork,
    },
    heatmapData: response.heatmap,
  };
}

