'use client';

import { usePageTracking } from '@/utils/analytics/usePageTracking';

export function PageTracker() {
  usePageTracking();
  return null;
}
