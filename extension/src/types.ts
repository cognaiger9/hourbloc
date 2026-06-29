export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  originalStartTime: number | null;
  adjustedStartTime: number | null;
  pausedAt: number;
  tagId: string | null;
  tagName: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type ExtMessage =
  | { type: 'START_TIMER'; tagId: string | null; tagName: string }
  | { type: 'PAUSE_TIMER' }
  | { type: 'STOP_TIMER' }
  | { type: 'GET_STATE' };

export type ExtResponse =
  | { ok: true; state: TimerState }
  | { ok: false; error: string };
