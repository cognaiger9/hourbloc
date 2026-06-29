'use client';

import { useEffect } from 'react';
import { useDayNavigation } from '@/features/analytics/hooks/useDayNavigation';
import { useDayAnalytics } from '@/features/analytics/hooks/useDayAnalytics';
import DayAnalyticsHeader from '@/features/analytics/components/DayAnalyticsHeader';
import DaySummaryStats from '@/features/analytics/components/DaySummaryStats';
import WorkTimeByTagSection from '@/features/analytics/components/WorkTimeByTagSection';
import DailyTimelineSection from '@/features/analytics/components/DailyTimelineSection';
import { trackDashboardEvent } from '@/utils/analytics/dashboardEvents';

export default function AnalyticsDayPage() {
  // Track page view on mount
  useEffect(() => {
    trackDashboardEvent.viewed('day');
  }, []);
  const {
    currentDate,
    formattedDateRange,
    formattedDateShort,
    isCurrentDateToday,
    handlePreviousDay,
    handleNextDay,
    handleGoToToday,
  } = useDayNavigation();

  const { data: analyticsData, loading, error } = useDayAnalytics(currentDate);

  // Show loading state
  if (loading) {
    return (
      <div className="flex-1 h-full bg-background p-6 md:p-8 overflow-y-auto">
        <div className="w-full max-w-[1280px] mx-auto flex flex-col gap-6">
          <DayAnalyticsHeader
            formattedDateRange={formattedDateRange}
            formattedDateShort={formattedDateShort}
            isCurrentDateToday={isCurrentDateToday}
            onPreviousDay={handlePreviousDay}
            onNextDay={handleNextDay}
            onGoToToday={handleGoToToday}
          />
          <div className="flex items-center justify-center h-64">
            <div className="text-foreground-secondary">Loading analytics...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex-1 h-full bg-background p-6 md:p-8 overflow-y-auto">
        <div className="w-full max-w-[1280px] mx-auto flex flex-col gap-6">
          <DayAnalyticsHeader
            formattedDateRange={formattedDateRange}
            formattedDateShort={formattedDateShort}
            isCurrentDateToday={isCurrentDateToday}
            onPreviousDay={handlePreviousDay}
            onNextDay={handleNextDay}
            onGoToToday={handleGoToToday}
          />
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!analyticsData) {
    return (
      <div className="flex-1 h-full bg-background p-6 md:p-8 overflow-y-auto">
        <div className="w-full max-w-[1280px] mx-auto flex flex-col gap-6">
          <DayAnalyticsHeader
            formattedDateRange={formattedDateRange}
            formattedDateShort={formattedDateShort}
            isCurrentDateToday={isCurrentDateToday}
            onPreviousDay={handlePreviousDay}
            onNextDay={handleNextDay}
            onGoToToday={handleGoToToday}
          />
          <div className="flex items-center justify-center h-64">
            <div className="text-foreground-secondary">No analytics data available for this day.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-background p-6 md:p-8 overflow-y-auto">
      <div className="w-full max-w-[1280px] mx-auto flex flex-col gap-6">
        <DayAnalyticsHeader
          formattedDateRange={formattedDateRange}
          formattedDateShort={formattedDateShort}
          isCurrentDateToday={isCurrentDateToday}
          onPreviousDay={handlePreviousDay}
          onNextDay={handleNextDay}
          onGoToToday={handleGoToToday}
        />

        {/* Top Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <DaySummaryStats
            totalWorkTime={analyticsData.totalWorkTime}
            totalBlocks={analyticsData.totalBlocks}
          />
          <WorkTimeByTagSection workTimeByTag={analyticsData.workTimeByTag} />
        </div>

        {/* Bottom Section (Timeline) */}
        <DailyTimelineSection
          plannedBars={analyticsData.plannedBars}
          actualBars={analyticsData.actualBars}
          viewingDate={currentDate}
        />
      </div>
    </div>
  );
}
