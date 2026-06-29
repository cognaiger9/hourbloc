import posthog from 'posthog-js';

export const trackTimerEvent = {
  started: (tagName: string | null) => {
    posthog.capture('timer_started', {
      tag_name: tagName || 'untagged',
      timestamp: new Date().toISOString(),
    });
  },

  paused: (elapsedSeconds: number) => {
    posthog.capture('timer_paused', {
      elapsed_seconds: elapsedSeconds,
      elapsed_minutes: Math.floor(elapsedSeconds / 60),
    });
  },

  resumed: (elapsedSeconds: number) => {
    posthog.capture('timer_resumed', {
      elapsed_seconds: elapsedSeconds,
    });
  },

  completed: (data: {
    tagName: string | null;
    duration: number;
    hasTitle: boolean;
    hasNotes: boolean;
  }) => {
    posthog.capture('timer_completed', {
      tag_name: data.tagName || 'untagged',
      duration_seconds: data.duration,
      duration_minutes: Math.floor(data.duration / 60),
      has_title: data.hasTitle,
      has_notes: data.hasNotes,
    });
  },

  tagSelected: (tagName: string | null) => {
    posthog.capture('timer_selected_tag', {
      tag_name: tagName || 'none',
    });
  },

  tagManagementOpened: () => {
    posthog.capture('timer_opened_tag_management');
  },

  logDrawerOpened: () => {
    posthog.capture('timer_opened_log_drawer');
  },
};
