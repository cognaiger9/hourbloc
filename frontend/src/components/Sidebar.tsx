'use client';

import { useState, useMemo, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/utils/common';
import { useTimer } from '@/contexts/TimerContext';
import { useUser } from '@/contexts/UserContext';
import ContactModal from './ContactModal';
import {
  Calendar,
  Crosshair,
  PieChart,
  ChevronDown,
  LogOut,
  PanelLeft,
  BookOpen,
  Mail,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

function SidebarComponent({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isRunning, isPaused } = useTimer();
  const { user, signOut } = useUser();
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(
    pathname?.startsWith('/app/analytics') ?? true
  );
  const [isPlanOpen, setIsPlanOpen] = useState(
    pathname === '/app' || pathname === '/app/weekly-goals' || pathname === '/app/backlog' ? true : false
  );
  const [isMinimized, setIsMinimized] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    // Redirect will be handled by AppLayoutInner based on explicit_logout flag
  };

  // Handle navigation with timer check
  // Returns true if navigation proceeded (either normally or programmatically), false if cancelled
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string): boolean => {
    // Only check if timer is actively running (not paused)
    if (isRunning && !isPaused) {
      // Prevent default navigation immediately to avoid lag
      e.preventDefault();
      
      // Show confirmation dialog (non-blocking since we already prevented default)
      const confirmed = window.confirm(
        'Timer is running. Are you sure you want to navigate away?'
      );
      
      if (confirmed) {
        // Navigate programmatically after confirmation
        router.push(href);
        return true; // Navigation proceeded
      }
      
      return false; // Navigation cancelled
    }
    // Allow normal Link navigation when timer is not running
    return true; // Navigation will proceed normally
  };

  const activeStates = useMemo(() => {
    return {
      isPlanActive: pathname === '/app' || pathname === '/app/weekly-goals' || pathname === '/app/backlog',
      isCalendarActive: pathname === '/app',
      isWeeklyGoalsActive: pathname === '/app/weekly-goals',
      isBacklogActive: pathname === '/app/backlog',
      isFocusActive: pathname === '/app/focus',
      isAnalyticsActive: pathname?.startsWith('/app/analytics') ?? false,
      isAnalyticsOverviewActive: pathname === '/app/analytics',
      isAnalyticsDayActive: pathname === '/app/analytics/day',
      isAnalyticsWeekActive: pathname === '/app/analytics/week',
      isAnalyticsYearActive: pathname === '/app/analytics/year',
      isReviewActive: pathname === '/app/review',
    };
  }, [pathname]);

  return (
    <aside
      className={cn(
        'relative flex flex-col justify-between h-full bg-background border-r border-border px-3 py-6 transition-all duration-300 ease-in-out shrink-0',
        isMinimized ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Top Section */}
      <div className="flex flex-col gap-8">
        {/* Logo + Minimize */}
        <div className="flex items-center justify-between pl-1 pr-1">
          {!isMinimized && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <Image
                  src="/logo-trans.png"
                  alt="hourbloc logo"
                  width={20}
                  height={20}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <span className="text-base font-medium tracking-tight text-foreground">
                hourbloc
              </span>
            </div>
          )}

          {/* Minimize Button */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="flex items-center justify-center w-[26px] h-[26px] rounded-md text-foreground-secondary hover:bg-black/5 hover:text-foreground transition-colors group ml-auto"
          >
            <PanelLeft width={16} height={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Navigation Links */}
        {!isMinimized && (
          <nav className="flex flex-col gap-1">
            {/* Plan Section */}
            <div className="flex flex-col mt-1">
              {/* Parent Link */}
              <div className="group flex items-center justify-between px-3 py-2 rounded-lg transition-colors w-full">
                <Link
                  href="/app"
                  onClick={(e) => {
                    setIsPlanOpen(true);
                    handleNavigation(e, '/app');
                  }}
                  className={cn(
                    'flex items-center gap-3 flex-1',
                    activeStates.isPlanActive
                      ? 'text-foreground'
                      : 'text-foreground-secondary hover:text-foreground'
                  )}
                >
                  <Calendar width={18} height={18} strokeWidth={1.5} />
                  <span className="text-sm font-medium">Plan</span>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsPlanOpen(!isPlanOpen);
                  }}
                  className="p-1 rounded hover:bg-black/5 transition-colors"
                >
                  <ChevronDown
                    width={14}
                    height={14}
                    strokeWidth={1.5}
                    className={cn(
                      'text-[#A1A1A1] group-hover:text-foreground-secondary transition-transform',
                      isPlanOpen && 'transform rotate-180'
                    )}
                  />
                </button>
              </div>

              {/* Sub Links Container */}
              {isPlanOpen && (
                <div className="flex flex-col gap-0.5 mt-1 pl-[34px] pr-2">
                  {/* Calendar */}
                  <Link
                    href="/app"
                    onClick={(e) => handleNavigation(e, '/app')}
                    className={cn(
                      'flex items-center px-2 py-1.5 rounded-md transition-colors',
                      activeStates.isCalendarActive
                        ? 'bg-green-light text-accent-green'
                        : 'text-foreground-secondary hover:bg-black/5'
                    )}
                  >
                    <span className="text-[13px] font-medium leading-5">
                      Calendar
                    </span>
                  </Link>

                  {/* Weekly Goals */}
                  <Link
                    href="/app/weekly-goals"
                    onClick={(e) => handleNavigation(e, '/app/weekly-goals')}
                    className={cn(
                      'flex items-center px-2 py-1.5 rounded-md transition-colors',
                      activeStates.isWeeklyGoalsActive
                        ? 'bg-green-light text-accent-green'
                        : 'text-foreground-secondary hover:bg-black/5'
                    )}
                  >
                    <span className="text-[13px] font-medium leading-5">
                      Weekly Goals
                    </span>
                  </Link>

                  {/* Backlog */}
                  <Link
                    href="/app/backlog"
                    onClick={(e) => handleNavigation(e, '/app/backlog')}
                    className={cn(
                      'flex items-center px-2 py-1.5 rounded-md transition-colors',
                      activeStates.isBacklogActive
                        ? 'bg-green-light text-accent-green'
                        : 'text-foreground-secondary hover:bg-black/5'
                    )}
                  >
                    <span className="text-[13px] font-medium leading-5">
                      Backlog
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* Focus */}
            <Link
              href="/app/focus"
              onClick={(e) => handleNavigation(e, '/app/focus')}
              className={cn(
                'group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all',
                activeStates.isFocusActive
                  ? 'bg-green-light text-accent-green'
                  : 'text-foreground-secondary hover:bg-black/5 hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <Crosshair width={18} height={18} strokeWidth={1.5} />
                <span className="text-sm font-medium">Focus</span>
              </div>
            </Link>

            {/* Review */}
            <Link
              href="/app/review"
              onClick={(e) => handleNavigation(e, '/app/review')}
              className={cn(
                'group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all',
                activeStates.isReviewActive
                  ? 'bg-green-light text-accent-green'
                  : 'text-foreground-secondary hover:bg-black/5 hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <BookOpen width={18} height={18} strokeWidth={1.5} />
                <span className="text-sm font-medium">Review</span>
              </div>
            </Link>

            {/* Analytics Section */}
            <div className="flex flex-col mt-1">
              {/* Parent Link */}
              <div className="group flex items-center justify-between px-3 py-2 rounded-lg transition-colors w-full">
                <Link
                  href="/app/analytics"
                  onClick={(e) => {
                    setIsAnalyticsOpen(true);
                    handleNavigation(e, '/app/analytics');
                  }}
                  className={cn(
                    'flex items-center gap-3 flex-1',
                    activeStates.isAnalyticsActive
                      ? 'text-foreground'
                      : 'text-foreground-secondary hover:text-foreground'
                  )}
                >
                  <PieChart width={18} height={18} strokeWidth={1.5} />
                  <span className="text-sm font-medium">Analytics</span>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsAnalyticsOpen(!isAnalyticsOpen);
                  }}
                  className="p-1 rounded hover:bg-black/5 transition-colors"
                >
                  <ChevronDown
                    width={14}
                    height={14}
                    strokeWidth={1.5}
                    className={cn(
                      'text-[#A1A1A1] group-hover:text-foreground-secondary transition-transform',
                      isAnalyticsOpen && 'transform rotate-180'
                    )}
                  />
                </button>
              </div>

              {/* Sub Links Container */}
              {isAnalyticsOpen && (
                <div className="flex flex-col gap-0.5 mt-1 pl-[34px] pr-2">
                  {/* Overview */}
                  <Link
                    href="/app/analytics"
                    onClick={(e) => handleNavigation(e, '/app/analytics')}
                    className={cn(
                      'flex items-center px-2 py-1.5 rounded-md transition-colors',
                      activeStates.isAnalyticsOverviewActive
                        ? 'bg-green-light text-accent-green'
                        : 'text-foreground-secondary hover:bg-black/5'
                    )}
                  >
                    <span className="text-[13px] font-medium leading-5">
                      Overview
                    </span>
                  </Link>

                  {/* Day */}
                  <Link
                    href="/app/analytics/day"
                    onClick={(e) => handleNavigation(e, '/app/analytics/day')}
                    className={cn(
                      'flex items-center px-2 py-1.5 rounded-md transition-colors',
                      activeStates.isAnalyticsDayActive
                        ? 'bg-green-light text-accent-green'
                        : 'text-foreground-secondary hover:bg-black/5'
                    )}
                  >
                    <span className="text-[13px] font-medium leading-5">Day</span>
                  </Link>

                  {/* Week */}
                  <Link
                    href="/app/analytics/week"
                    onClick={(e) => handleNavigation(e, '/app/analytics/week')}
                    className={cn(
                      'flex items-center px-2 py-1.5 rounded-md transition-colors',
                      activeStates.isAnalyticsWeekActive
                        ? 'bg-green-light text-accent-green'
                        : 'text-foreground-secondary hover:bg-black/5'
                    )}
                  >
                    <span className="text-[13px] font-medium leading-5">Week</span>
                  </Link>

                  {/* Year */}
                  <Link
                    href="/app/analytics/year"
                    onClick={(e) => handleNavigation(e, '/app/analytics/year')}
                    className={cn(
                      'flex items-center px-2 py-1.5 rounded-md transition-colors',
                      activeStates.isAnalyticsYearActive
                        ? 'bg-green-light text-accent-green'
                        : 'text-foreground-secondary hover:bg-black/5'
                    )}
                  >
                    <span className="text-[13px] font-medium leading-5">Year</span>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>

      {/* Account Nav (Bottom) */}
      {!isMinimized && (
        <div className="flex flex-col gap-2">
          {/* Contact */}
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground-secondary hover:bg-black/5 hover:text-foreground transition-colors w-full text-left"
          >
            <Mail width={18} height={18} strokeWidth={1.5} />
            <span className="text-sm font-medium">Contact</span>
          </button>

          {/* Log Out */}
          <button
            onClick={handleSignOut}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground-secondary hover:bg-black/5 hover:text-foreground transition-colors w-full text-left"
          >
            <LogOut width={18} height={18} strokeWidth={1.5} />
            <span className="text-sm font-medium">Log Out</span>
          </button>

          {/* Divider */}
          <div className="h-px w-full bg-border my-1" />

          {/* User Profile */}
          <div className="group flex items-center gap-3 px-3 py-2 rounded-lg w-full"
          >
            {/* Avatar */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 border border-white/20 shadow-inner shrink-0 relative overflow-hidden">
              {user?.user_metadata?.avatar_url ? (
                <Image
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.full_name || 'User'}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-white/10" />
              )}
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {user?.user_metadata?.full_name || user?.email || 'User'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </aside>
  );
}

export default memo(SidebarComponent);
