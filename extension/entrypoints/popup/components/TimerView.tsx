import { useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { TimerState } from '../../../src/types';
import { TagSelector } from './TagSelector';

interface Props {
  session: Session;
  timerState: TimerState | null;
  onTimerStateChange: (state: TimerState) => void;
  onLogout: () => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

function computeElapsed(state: TimerState): number {
  if (!state.isRunning) return 0;
  if (state.isPaused) return Math.floor(state.pausedAt / 1000);
  return Math.floor((Date.now() - (state.adjustedStartTime ?? Date.now())) / 1000);
}

type MsgResult = { ok: boolean; state?: TimerState; error?: string };

function sendMsg(msg: object): Promise<MsgResult> {
  return new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));
}

export function TimerView({ session, timerState, onTimerStateChange, onLogout }: Props) {
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [selectedTagName, setSelectedTagName] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stopError, setStopError] = useState<string | null>(null);
  const stateRef = useRef(timerState);

  useEffect(() => {
    stateRef.current = timerState;
    if (timerState) setElapsed(computeElapsed(timerState));
  }, [timerState]);

  // Tick every 500ms when running and not paused
  useEffect(() => {
    if (!timerState?.isRunning || timerState.isPaused) return;
    const id = setInterval(() => {
      if (stateRef.current) setElapsed(computeElapsed(stateRef.current));
    }, 500);
    return () => clearInterval(id);
  }, [timerState?.isRunning, timerState?.isPaused]);

  const isRunning = timerState?.isRunning ?? false;
  const isPaused = timerState?.isPaused ?? false;
  const token = session.access_token;

  const handleStart = async () => {
    const res = await sendMsg({ type: 'START_TIMER', tagId: selectedTagId, tagName: selectedTagName });
    if (res.ok && res.state) onTimerStateChange(res.state);
  };

  const handlePause = async () => {
    const res = await sendMsg({ type: 'PAUSE_TIMER' });
    if (res.ok && res.state) onTimerStateChange(res.state);
  };

  const handleStop = async () => {
    setSaving(true);
    setStopError(null);
    const res = await sendMsg({ type: 'STOP_TIMER' });
    setSaving(false);
    if (res.ok && res.state) {
      onTimerStateChange(res.state);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setStopError(res.error ?? 'Failed to save - try again');
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#1b1b1b]">HourBloc</span>
        <button
          onClick={onLogout}
          className="text-xs text-[#6d6d6d] hover:text-[#1b1b1b] transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>

      {/* Timer display */}
      <div className="flex flex-col items-center py-5 gap-2">
        <div
          className={`text-4xl font-mono font-bold tracking-tight tabular-nums ${
            isRunning ? 'text-[#1b1b1b]' : 'text-[#c4c2be]'
          }`}
        >
          {formatTime(elapsed)}
        </div>

        {isRunning && (
          <div className="flex items-center gap-1.5 text-xs text-[#6d6d6d]">
            {isPaused ? (
              <span className="text-amber-500 font-medium">Paused</span>
            ) : (
              <>
                <span className="w-1.5 h-1.5 bg-[#3cbf6f] rounded-full animate-pulse" />
                <span>{timerState?.tagName || 'Tracking'}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Tag selector - only when idle */}
      {!isRunning && (
        <TagSelector
          token={token}
          value={selectedTagId}
          onChange={(id, name) => {
            setSelectedTagId(id);
            setSelectedTagName(name);
          }}
        />
      )}

      {/* Saved confirmation / error */}
      {saved && (
        <div className="text-center text-sm text-[#3cbf6f] font-medium">
          Session saved!
        </div>
      )}
      {stopError && (
        <div className="text-center text-xs text-red-500">{stopError}</div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {!isRunning && (
          <button
            onClick={handleStart}
            className="flex-1 py-2.5 px-4 bg-[#3cbf6f] hover:bg-[#33ad64] active:bg-[#2e9a5a] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Start
          </button>
        )}

        {isRunning && (
          <>
            <button
              onClick={handlePause}
              className="flex-1 py-2.5 px-4 bg-white border border-[#e4e2dd] hover:bg-[#f7f6f3] text-[#1b1b1b] text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={handleStop}
              disabled={saving}
              className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {saving ? 'Saving...' : 'Stop'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
