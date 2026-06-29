import { createBlock } from '../src/lib/api';
import { supabase } from '../src/lib/supabase';
import type { TimerState, ExtMessage } from '../src/types';

const DEFAULT_STATE: TimerState = {
  isRunning: false,
  isPaused: false,
  originalStartTime: null,
  adjustedStartTime: null,
  pausedAt: 0,
  tagId: null,
  tagName: '',
};

async function getTimerState(): Promise<TimerState> {
  const result = await chrome.storage.local.get('timerState');
  return (result.timerState as TimerState) ?? DEFAULT_STATE;
}

async function setTimerState(state: TimerState): Promise<void> {
  await chrome.storage.local.set({ timerState: state });
}

async function handleMessage(message: ExtMessage): Promise<{ ok: boolean; state?: TimerState; error?: string }> {
  switch (message.type) {
    case 'GET_STATE': {
      return { ok: true, state: await getTimerState() };
    }

    case 'START_TIMER': {
      const now = Date.now();
      const state: TimerState = {
        isRunning: true,
        isPaused: false,
        originalStartTime: now,
        adjustedStartTime: now,
        pausedAt: 0,
        tagId: message.tagId,
        tagName: message.tagName,
      };
      await setTimerState(state);
      return { ok: true, state };
    }

    case 'PAUSE_TIMER': {
      const state = await getTimerState();
      if (!state.isRunning) return { ok: true, state };

      if (state.isPaused) {
        // Resume: shift adjustedStartTime forward so elapsed continues from pausedAt
        const now = Date.now();
        const next = { ...state, isPaused: false, adjustedStartTime: now - state.pausedAt };
        await setTimerState(next);
        return { ok: true, state: next };
      } else {
        // Pause: record current elapsed ms
        const now = Date.now();
        const elapsedMs = now - (state.adjustedStartTime ?? now);
        const next = { ...state, isPaused: true, pausedAt: elapsedMs };
        await setTimerState(next);
        return { ok: true, state: next };
      }
    }

    case 'STOP_TIMER': {
      const state = await getTimerState();
      await setTimerState(DEFAULT_STATE);

      if (!state.isRunning || state.originalStartTime === null) {
        return { ok: true, state: DEFAULT_STATE };
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return { ok: false, error: 'Not authenticated' };
      }

      await createBlock(session.access_token, state);
      return { ok: true, state: DEFAULT_STATE };
    }

    default:
      return { ok: false, error: 'Unknown message type' };
  }
}

export default defineBackground(() => {
  // Chrome MV3 service workers can be terminated; alarms keep it responsive.
  chrome.alarms.create('keepAlive', { periodInMinutes: 0.4 });
  chrome.alarms.onAlarm.addListener(() => {
    // Heartbeat - intentionally empty
  });

  chrome.runtime.onMessage.addListener((message: ExtMessage, _sender, sendResponse) => {
    handleMessage(message)
      .then(sendResponse)
      .catch((err: Error) => sendResponse({ ok: false, error: err.message }));
    return true; // Keep the message channel open for async response
  });
});
