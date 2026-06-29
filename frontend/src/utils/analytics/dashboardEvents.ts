import posthog from 'posthog-js';

export const trackDashboardEvent = {
  viewed: (dashboardType: 'overview' | 'day' | 'week' | 'year') => {
    posthog.capture('analytics_viewed_dashboard', {
      dashboard_type: dashboardType,
    });
  },

  monthNavigated: (direction: 'prev' | 'next') => {
    posthog.capture('analytics_navigated_month', {
      direction,
    });
  },

  heatmapDayClicked: (date: string, hasActivity: boolean) => {
    posthog.capture('analytics_clicked_heatmap_day', {
      date,
      has_activity: hasActivity,
    });
  },

  exportedData: (exportType: string) => {
    posthog.capture('analytics_exported_data', {
      export_type: exportType,
    });
  },
};
