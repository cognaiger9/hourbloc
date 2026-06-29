'use client';

import { useEffect } from 'react';
import { useMonthNavigation } from '@/features/analytics/hooks/useMonthNavigation';
import { useCalendarHeatmap } from '@/features/analytics/hooks/useCalendarHeatmap';
import { useOverviewAnalytics } from '@/features/analytics/hooks/useOverviewAnalytics';
import TodaysWorkSection from '@/features/analytics/components/TodaysWorkSection';
import StatsSection from '@/features/analytics/components/StatsSection';
import CalendarHeatmap from '@/features/analytics/components/CalendarHeatmap';
import { trackDashboardEvent } from '@/utils/analytics/dashboardEvents';
import { trackActivationMilestone } from '@/utils/analytics/activationEvents';

export default function AnalyticsPage() {
  // Initialize with current month and year
  const now = new Date();
  const { currentMonth, currentYear, monthName, handlePreviousMonth, handleNextMonth } =
    useMonthNavigation(now.getMonth(), now.getFullYear());

  // Use TanStack Query hook with caching
  const { data, isLoading, error, isFetching } = useOverviewAnalytics(
    currentMonth,
    currentYear
  );

  const calendarDays = useCalendarHeatmap(
    currentMonth,
    currentYear,
    data?.heatmapData ?? []
  );

  // Track page view on mount
  useEffect(() => {
    trackDashboardEvent.viewed('overview');

    // Check for first analytics view activation milestone
    const hasViewedAnalytics = localStorage.getItem('has_viewed_analytics');
    if (!hasViewedAnalytics) {
      trackActivationMilestone.analyticsViewed();
      localStorage.setItem('has_viewed_analytics', 'true');
    }
  }, []);

  if (error) {
    return (
      <div className="flex-1 h-full bg-background p-6 md:p-8 overflow-y-auto">
        <div className="w-full max-w-[1184px] mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <h3 className="font-semibold mb-2">Error loading analytics</h3>
            <p className="text-sm">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex-1 h-full bg-background p-6 md:p-8 overflow-y-auto">
        <div className="w-full max-w-[1184px] mx-auto">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-5 space-y-5">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="lg:col-span-7 h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { todayData, lifetimeData, streaksData, calendarData } = data;

  return (
    <div className="flex-1 h-full bg-background p-6 md:p-8 overflow-y-auto">
      {/* Show subtle indicator during background refetch */}
      {isFetching && !isLoading && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-700 shadow-sm">
            Refreshing analytics...
          </div>
        </div>
      )}

      <main className="w-full max-w-[1184px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column (Today + Streaks) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <TodaysWorkSection data={todayData} />
          <StatsSection lifetimeData={lifetimeData} streaksData={streaksData} />
        </div>

        {/* Right Column (Calendar) */}
        <CalendarHeatmap
          monthName={monthName}
          calendarDays={calendarDays}
          calendarData={calendarData}
          onPreviousMonth={() => {
            handlePreviousMonth();
            trackDashboardEvent.monthNavigated('prev');
          }}
          onNextMonth={() => {
            handleNextMonth();
            trackDashboardEvent.monthNavigated('next');
          }}
        />
      </main>
    </div>
  );
}
