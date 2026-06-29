'use client';

import { useEffect } from 'react';
import WeeklyBarChart from '@/features/analytics/components/WeeklyBarChart';
import WeekAnalyticsHeader from '@/features/analytics/components/WeekAnalyticsHeader';
import WeekSummaryCard from '@/features/analytics/components/WeekSummaryCard';
import { useWeekAnalytics } from '@/features/analytics/hooks/useWeekAnalytics';
import { useCalendarNavigation } from '@/features/calendar/hooks/useCalendarNavigation';
import { getMondayOfWeek } from '@/utils/dateUtils';
import { trackDashboardEvent } from '@/utils/analytics/dashboardEvents';

export default function AnalyticsWeekPage() {
  // Track page view on mount
  useEffect(() => {
    trackDashboardEvent.viewed('week');
  }, []);
  // Use calendar navigation to manage week selection
  const { currentDate, datesToShow, navigateDate, goToToday } = useCalendarNavigation();

  // Get the Monday of the current viewing week
  const weekStart = getMondayOfWeek(currentDate);

  // Fetch analytics data for the selected week
  const { data, loading, error } = useWeekAnalytics(weekStart);

  return (
    <div className="flex-1 h-full bg-background p-6 md:p-8 overflow-y-auto">
      <div className="w-full max-w-[1152px] mx-auto">
        <WeekAnalyticsHeader
          currentDate={currentDate}
          datesToShow={datesToShow}
          navigateDate={navigateDate}
          goToToday={goToToday}
        />

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-muted-foreground">Loading week analytics...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-destructive">{error}</div>
          </div>
        )}

        {!loading && !error && data && (
          <>
            <WeekSummaryCard
              totalWorkTime={data.totalWorkTime}
              previousWeekWorkTime={data.previousWeekWorkTime}
              totalBlocks={data.totalBlocks}
              workTimeByTag={data.workTimeByTag}
            />

            {/* Weekly View Card */}
            <WeeklyBarChart days={data.dailyData} />
          </>
        )}
      </div>
    </div>
  );
}
