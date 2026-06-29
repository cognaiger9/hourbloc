import posthog from 'posthog-js';

export const trackReviewEvent = {
  blockEdited: (blockId: string, fieldsChanged: string[]) => {
    posthog.capture('review_edited_block', {
      block_id: blockId,
      fields_changed: fieldsChanged,
    });
  },

  blockDeleted: (blockId: string, duration: number) => {
    posthog.capture('review_deleted_block', {
      block_id: blockId,
      duration_minutes: duration,
    });
  },

  blockCreated: (data: { hasTag: boolean; duration: number }) => {
    posthog.capture('review_created_block', {
      has_tag: data.hasTag,
      duration_minutes: data.duration,
    });
  },

  dateNavigated: (direction: 'prev' | 'next' | 'today') => {
    posthog.capture('review_navigated_date', {
      direction,
    });
  },
};
