'use client';

import { useState, useEffect } from 'react';
import { sessionsApi } from '@/features/focus/api/sessions';
import { useUser } from '@/contexts/UserContext';
import { trackTimerEvent } from '@/utils/analytics/timerEvents';
import { trackActivationMilestone } from '@/utils/analytics/activationEvents';

interface UseFocusTimerReturn {
  elapsedSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  isSaving: boolean;
  saveError: string | null;
  start: (tagName: string | null) => void;
  pause: () => void;
  finish: (tagId: string | null, tagName: string, title?: string, notes?: string | null, onSuccess?: () => void) => void;
}

export function useFocusTimer(
  onStatusChange?: (status: { isRunning: boolean; isPaused: boolean }) => void
): UseFocusTimerReturn {
  const { timezone } = useUser();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [originalStartTime, setOriginalStartTime] = useState<number | null>(null);
  const [pausedAt, setPausedAt] = useState<number>(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // isSaving is always false with optimistic updates
  const isSaving = false;

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && !isPaused && startTime !== null) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedSeconds(elapsed);
      }, 500);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, isPaused, startTime]);

  // Start timer
  const start = (tagName: string | null) => {
    const now = Date.now();
    setIsRunning(true);
    setIsPaused(false);
    setStartTime(now);
    setOriginalStartTime(now);
    setPausedAt(0);
    setElapsedSeconds(0);
    setSaveError(null);

    // Notify status change
    if (onStatusChange) {
      onStatusChange({ isRunning: true, isPaused: false });
    }

    // Track timer start (analytics)
    trackTimerEvent.started(tagName);

    // Check for first timer activation milestone (analytics)
    const hasStartedTimer = localStorage.getItem('has_started_timer');
    if (!hasStartedTimer) {
      trackActivationMilestone.firstTimer();
      localStorage.setItem('has_started_timer', 'true');
    }
  };

  // Pause/Resume timer
  const pause = () => {
    if (isPaused) {
      // Resume - adjust startTime to account for paused duration
      const now = Date.now();
      setIsPaused(false);
      // Set startTime so elapsed continues from where we paused
      setStartTime(now - pausedAt);

      // Notify status change
      if (onStatusChange) {
        onStatusChange({ isRunning: true, isPaused: false });
      }

      // Track resume (analytics)
      trackTimerEvent.resumed(Math.floor(pausedAt / 1000));
    } else {
      // Pause - store current elapsed time in milliseconds
      setIsPaused(true);
      if (startTime !== null) {
        const now = Date.now();
        const elapsedMs = now - startTime;
        setPausedAt(elapsedMs);

        // Notify status change
        if (onStatusChange) {
          onStatusChange({ isRunning: true, isPaused: true });
        }

        // Track pause (analytics)
        trackTimerEvent.paused(Math.floor(elapsedMs / 1000));
      }
    }
  };

  // Finish timer
  const finish = (tagId: string | null, tagName: string, title?: string, notes?: string | null, onSuccess?: () => void) => {
    // Don't proceed if timer wasn't actually running
    if (originalStartTime === null || elapsedSeconds === 0) {
      return;
    }

    // Calculate start and end times using REAL start time (not adjusted)
    const startTimeDate = new Date(originalStartTime);
    const endTimeDate = new Date();

    // Track timer completion before resetting (analytics)
    trackTimerEvent.completed({
      tagName,
      duration: elapsedSeconds,
      hasTitle: !!title,
      hasNotes: !!notes,
    });

    // Optimistic update: reset timer state immediately
    setIsRunning(false);
    setIsPaused(false);
    setStartTime(null);
    setOriginalStartTime(null);
    setPausedAt(0);
    setElapsedSeconds(0);
    setSaveError(null);

    // Notify status change
    if (onStatusChange) {
      onStatusChange({ isRunning: false, isPaused: false });
    }

    // Fire and forget: save session to backend (don't await)
    sessionsApi.create({
      tagId,
      startTime: startTimeDate,
      endTime: endTimeDate,
      durationSeconds: elapsedSeconds,
      tagName,
      timezone,
      title,
      notes,
    }).then(() => {
      // Call success callback after backend saves the block
      if (onSuccess) {
        onSuccess();
      }
    }).catch((error) => {
      // Log errors but don't block UI
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to save session. Please try again.';
      setSaveError(errorMessage);
      console.error('Failed to save focus session:', error);
    });
  };

  return {
    elapsedSeconds,
    isRunning,
    isPaused,
    isSaving,
    saveError,
    start,
    pause,
    finish,
  };
}

