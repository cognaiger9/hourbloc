import posthog from 'posthog-js';

export const trackActivationMilestone = {
  signup: (method: 'google' | 'email') => {
    posthog.capture('activation_signup_completed', {
      signup_method: method,
    });

    // Set user property
    if (typeof posthog.people !== 'undefined') {
      posthog.people.set({
        signup_method: method,
        signup_at: new Date().toISOString(),
      });
    }
  },

  firstBlock: () => {
    posthog.capture('activation_first_block_created', {
      milestone: 'first_block',
    });

    if (typeof posthog.people !== 'undefined') {
      posthog.people.set_once({
        first_block_at: new Date().toISOString(),
      });
    }
  },

  firstTimer: () => {
    posthog.capture('activation_first_timer_started', {
      milestone: 'first_timer',
    });

    if (typeof posthog.people !== 'undefined') {
      posthog.people.set_once({
        first_timer_at: new Date().toISOString(),
      });
    }
  },

  analyticsViewed: () => {
    posthog.capture('activation_analytics_viewed', {
      milestone: 'analytics_view',
    });

    if (typeof posthog.people !== 'undefined') {
      posthog.people.set_once({
        first_analytics_view_at: new Date().toISOString(),
      });
    }
  },
};
