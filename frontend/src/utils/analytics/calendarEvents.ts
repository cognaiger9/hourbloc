import posthog from 'posthog-js';

export const trackCalendarEvent = {
  blockCreated: (block: {
    id: string;
    duration: number;
    hasTag: boolean;
    hasNotes: boolean;
    viewMode: string;
  }) => {
    posthog.capture('calendar_created_block', {
      block_id: block.id,
      duration_minutes: block.duration,
      has_tag: block.hasTag,
      has_notes: block.hasNotes,
      view_mode: block.viewMode,
    });
  },

  blockEdited: (block: { id: string; fields_changed: string[] }) => {
    posthog.capture('calendar_edited_block', {
      block_id: block.id,
      fields_changed: block.fields_changed,
    });
  },

  blockDeleted: (block: { id: string; duration: number }) => {
    posthog.capture('calendar_deleted_block', {
      block_id: block.id,
      duration_minutes: block.duration,
    });
  },

  viewModeChanged: (viewMode: string) => {
    posthog.capture('calendar_changed_view', {
      view_mode: viewMode,
    });
  },

  navigatedDate: (direction: string, viewMode: string) => {
    posthog.capture('calendar_navigated', {
      direction,
      view_mode: viewMode,
    });
  },
};
