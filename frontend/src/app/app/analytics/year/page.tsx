'use client';

import { useMemo, useEffect } from 'react';
import YearlyHeatmap from '@/features/analytics/components/YearlyHeatmap';
import YearAnalyticsHeader from '@/features/analytics/components/YearAnalyticsHeader';
import YearSummaryStatsCard from '@/features/analytics/components/YearSummaryStatsCard';
import YearTagSummaryCard from '@/features/analytics/components/YearTagSummaryCard';
import { useYearlyActivity } from '@/features/analytics/hooks/useYearlyActivity';
import { useYearNavigation } from '@/features/analytics/hooks/useYearNavigation';
import { useYearAnalytics } from '@/features/analytics/hooks/useYearAnalytics';
import { trackDashboardEvent } from '@/utils/analytics/dashboardEvents';

export default function AnalyticsYearPage() {
  // Track page view on mount
  useEffect(() => {
    trackDashboardEvent.viewed('year');
  }, []);
  const currentYear = new Date().getFullYear();
  const { currentYear: selectedYear, handlePreviousYear, handleNextYear } = useYearNavigation(currentYear);

  // Fetch analytics data using TanStack Query
  const { data, loading, error } = useYearAnalytics(selectedYear);

  // Memoize the monthly activity base to prevent infinite loops
  const monthlyActivityBase = useMemo(() => {
    return data?.monthlyActivityBase || [];
  }, [data?.monthlyActivityBase]);

  const monthlyActivity = useYearlyActivity(
    selectedYear,
    monthlyActivityBase
  );

  return (
    <div className="flex-1 h-full bg-background p-6 md:p-12 overflow-y-auto">
      <div className="w-full max-w-[1280px] mx-auto">
        <YearAnalyticsHeader
          currentYear={selectedYear}
          onPreviousYear={handlePreviousYear}
          onNextYear={handleNextYear}
        />

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-muted-foreground">Loading year analytics...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-destructive">{error}</div>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Top Section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
              <YearSummaryStatsCard summaryStats={data.summaryStats} />
              <YearTagSummaryCard workTimeByTag={data.workTimeByTag} />
            </div>

            {/* Activity Grid (Heatmap) */}
            {monthlyActivity.length > 0 && <YearlyHeatmap months={monthlyActivity} />}
          </>
        )}
      </div>
    </div>
  );
}
