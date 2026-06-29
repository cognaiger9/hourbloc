'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useMemo } from 'react';

interface TimerContextType {
  isRunning: boolean;
  isPaused: boolean;
  setTimerStatus: (status: { isRunning: boolean; isPaused: boolean }) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [timerStatus, setTimerStatus] = useState({
    isRunning: false,
    isPaused: false,
  });

  const handleSetTimerStatus = useCallback(
    (status: { isRunning: boolean; isPaused: boolean }) => {
      setTimerStatus(status);
    },
    []
  );

  const value = useMemo(
    () => ({
      isRunning: timerStatus.isRunning,
      isPaused: timerStatus.isPaused,
      setTimerStatus: handleSetTimerStatus,
    }),
    [timerStatus.isRunning, timerStatus.isPaused, handleSetTimerStatus]
  );

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  // Return default values if not in provider (timer not running)
  if (context === undefined) {
    return {
      isRunning: false,
      isPaused: false,
      setTimerStatus: () => {},
    };
  }
  return context;
}

