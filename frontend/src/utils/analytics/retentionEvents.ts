import posthog from 'posthog-js';

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export const trackRetentionEvent = {
  // Track daily active usage
  dailyActive: () => {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = localStorage.getItem('last_active_date');

    if (lastActive !== today) {
      posthog.capture('daily_active', {
        date: today,
      });

      if (typeof posthog.people !== 'undefined') {
        posthog.people.set({
          last_active_date: today,
        });
      }

      localStorage.setItem('last_active_date', today);
    }
  },

  // Track weekly active usage
  weeklyActive: () => {
    const weekNumber = getWeekNumber(new Date());
    const lastActiveWeek = localStorage.getItem('last_active_week');

    if (lastActiveWeek !== weekNumber.toString()) {
      posthog.capture('weekly_active', {
        week_number: weekNumber,
      });

      localStorage.setItem('last_active_week', weekNumber.toString());
    }
  },

  // Track feature usage frequency
  featureUsed: (featureName: string) => {
    posthog.capture('feature_used', {
      feature_name: featureName,
      timestamp: new Date().toISOString(),
    });
  },
};
