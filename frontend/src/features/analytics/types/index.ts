import type { LucideIcon } from 'lucide-react';

export interface TagBreakdown {
  tag: string;
  minutes: number;
  color: string;
}

export interface DayData {
  dayName: string;
  date: string;
  fullDate?: Date; // Full date object for tooltip formatting
  workTime: string;
  workTimeMinutes: number; // Total minutes for height calculation
  tags: TagBreakdown[]; // Tag breakdown for stacked bars
}

export interface TodayData {
  date: Date;
  workTime: string;
  blocks: number;
}

export interface StreaksData {
  currentStreak: number;
  bestStreak: number;
  message: string;
}

export interface CalendarData {
  month: number; // 0-indexed
  year: number;
  daysWorked: number;
  totalDays: number;
  avgWorkDay: string;
  totalWork: string;
}

export interface LifetimeData {
  totalWorkTime: string;
  totalBlocks: number;
  workDays: number;
}

export interface HeatmapDay {
  day: number;
  opacity: number;
  hasWork: boolean;
  workTime?: string;
  blocks?: number;
}

export interface CalendarDay {
  day: number | null;
  isToday: boolean;
  heatmapData?: {
    opacity: number;
    hasWork: boolean;
    workTime?: string;
    blocks?: number;
  };
}

export interface TooltipData {
  day: number;
  workTime: string;
  blocks: number;
  position: { x: number; y: number };
}

export interface WorkTimeByTag {
  tag: string;
  time: string;
  percentage: number;
  color: string;
}

export interface TimelineBar {
  start: number; // percentage from left (0-100) - UTC based from backend
  width: number; // percentage width (0-100) - UTC based from backend
  color: string;
  opacity?: number;
  borderColor?: string;
  borderOpacity?: number;
  hasDots?: boolean;
  title?: string; // Block title/name
  startTime?: string; // Start time (e.g., "9:00 AM") - UTC based
  endTime?: string; // End time (e.g., "10:30 AM") - UTC based
  startDateTime?: string; // ISO 8601 datetime string (UTC)
  endDateTime?: string; // ISO 8601 datetime string (UTC)
}

export interface DayAnalyticsData {
  date: Date;
  totalWorkTime: string;
  totalBlocks: number;
  workTimeByTag: WorkTimeByTag[];
  plannedBars: TimelineBar[];
  actualBars: TimelineBar[];
  nowPosition?: number; // Position of "NOW" line as percentage
}

export interface WeekAnalyticsData {
  weekStart: Date;
  weekEnd: Date;
  totalWorkTime: string;
  previousWeekWorkTime: string;
  totalBlocks: number;
  workTimeByTag: WorkTimeByTag[];
  dailyData: DayData[];
}

export interface YearSummaryStat {
  label: string;
  value: string;
  icon: LucideIcon;
}

export interface DailyActivityData {
  hasActivity: boolean;
  workTime: string | null;
  blocks: number | null;
}

export interface MonthlyActivityBase {
  month: string;
  hours: string;
  monthIndex: number; // 0-11 for Jan-Dec
  dailyActivity: Record<string, DailyActivityData>; // date string (YYYY-MM-DD) -> activity data
}

// Import MonthData type from YearlyHeatmap component
export interface MonthData {
  month: string;
  hours: string;
  year: number;
  monthIndex: number;
  activity: Map<string, DailyActivityData>; // Map of date to activity data
}

export interface YearAnalyticsData {
  year: number;
  summaryStats: YearSummaryStat[];
  workTimeByTag: WorkTimeByTag[];
  monthlyActivityBase: MonthlyActivityBase[];
}

