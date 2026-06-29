'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, ReactNode } from 'react';

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      try {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',

          // Performance optimizations
          loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') {
              posthog.debug();
            }
          },

          // Capture settings
          capture_pageview: false, // We'll manually track page views for better control
          capture_pageleave: true,
          autocapture: {
            dom_event_allowlist: ['click', 'submit'], // Only capture clicks and form submissions
            url_allowlist: ['/app/*'], // Only autocapture in app routes
          },

          // Session replay configuration
          session_recording: {
            maskAllInputs: true, // Mask all input fields by default
            maskTextSelector: '[data-private]', // Mask elements with data-private attribute
            recordCrossOriginIframes: false,
          },

          // Privacy settings
          opt_out_capturing_by_default: false,
          persistence: 'localStorage',
          before_send: (event) => {
            // Remove PII from properties
            if (event?.properties) {
              delete event.properties.email; // Don't auto-capture email in events
            }
            return event;
          },

          // Disable features we don't need
          disable_surveys: true,
          disable_compression: false,
        });
      } catch (error) {
        console.warn('PostHog initialization failed:', error);
      }
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
