'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useUser } from '@/contexts/UserContext';
import { TimerProvider } from '@/contexts/TimerContext';
import { trackRetentionEvent } from '@/utils/analytics/retentionEvents';
import { usePrefetchEssentialData } from '@/hooks/usePrefetchEssentialData';

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  const { prefetchEssentialData } = usePrefetchEssentialData();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !user) {
      // Check if this was an explicit logout
      const isExplicitLogout = sessionStorage.getItem('explicit_logout') === 'true';

      if (isExplicitLogout) {
        // Clear flag and redirect to landing page
        sessionStorage.removeItem('explicit_logout');
        router.replace('/');
      } else {
        // Session expired or unauthorized access - redirect to login
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [user, isLoading, router, pathname]);

  // Track daily and weekly active users
  useEffect(() => {
    if (user) {
      trackRetentionEvent.dailyActive();
      trackRetentionEvent.weeklyActive();
    }
  }, [user]);

  // Prefetch essential data when user authenticates
  useEffect(() => {
    if (user && !isLoading) {
      prefetchEssentialData();
    }
  }, [user, isLoading, prefetchEssentialData]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-surface text-foreground antialiased overflow-hidden items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-border border-t-accent-green rounded-full animate-spin" />
          <p className="text-sm text-foreground-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children until authenticated
  if (!user) {
    return null;
  }

  return (
    <TimerProvider>
      <div className="flex h-screen w-full bg-surface text-foreground antialiased overflow-hidden">
        <Sidebar />
        <main className="flex-1 h-full overflow-hidden">{children}</main>
      </div>
    </TimerProvider>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayoutInner>{children}</AppLayoutInner>;
}

