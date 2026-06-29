import { createBlock } from '../src/lib/api';
import { supabase } from '../src/lib/supabase';
import type { TimerState, ExtMessage } from '../src/types';

// Auth runs in the background while the popup is closed, so results are surfaced via notifications.
function notify(message: string): void {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
    title: 'HourBloc',
    message,
  });
}

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

function computeElapsedSeconds(state: TimerState): number {
  if (!state.isRunning) return 0;
  if (state.isPaused) return Math.floor(state.pausedAt / 1000);
  return Math.floor((Date.now() - (state.adjustedStartTime ?? Date.now())) / 1000);
}

function updateBadge(state: TimerState): void {
  if (!state.isRunning) {
    chrome.action.setBadgeText({ text: '' });
    return;
  }
  if (state.isPaused) {
    chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
    chrome.action.setBadgeText({ text: '||' });
    return;
  }
  const seconds = computeElapsedSeconds(state);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const text = hours > 0 ? `${hours}h` : `${minutes}m`;
  chrome.action.setBadgeBackgroundColor({ color: '#3cbf6f' });
  chrome.action.setBadgeText({ text });
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
      updateBadge(state);
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
        updateBadge(next);
        return { ok: true, state: next };
      } else {
        // Pause: record current elapsed ms
        const now = Date.now();
        const elapsedMs = now - (state.adjustedStartTime ?? now);
        const next = { ...state, isPaused: true, pausedAt: elapsedMs };
        await setTimerState(next);
        updateBadge(next);
        return { ok: true, state: next };
      }
    }

    case 'START_GOOGLE_AUTH': {
      // Runs in the background so the popup (which closes on focus loss) doesn't interrupt the flow.
      // authPending lets the popup show a loading state when reopened mid-flow.
      await chrome.storage.local.set({ authPending: true });
      try {
        const redirectUrl = chrome.identity.getRedirectURL();
        const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
        });
        if (oauthError || !data.url) throw oauthError ?? new Error('No auth URL returned');

        const responseUrl = await chrome.identity.launchWebAuthFlow({
          url: data.url,
          interactive: true,
        });
        if (!responseUrl) throw new Error('Auth was cancelled');

        // launchWebAuthFlow returns the full redirect URL; exchangeCodeForSession needs the bare ?code value.
        const code = new URL(responseUrl).searchParams.get('code');
        if (!code) throw new Error('No authorization code in redirect');

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;

        await chrome.storage.local.remove('authPending');
        notify('Signed in - click the HourBloc icon to start tracking.');
        return { ok: true };
      } catch (err) {
        await chrome.storage.local.remove('authPending');
        notify(`Sign-in failed: ${(err as Error).message}`);
        throw err; // still report to the popup if it happens to still be open
      }
    }

    case 'STOP_TIMER': {
      const state = await getTimerState();
      await setTimerState(DEFAULT_STATE);
      updateBadge(DEFAULT_STATE);

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
  chrome.alarms.onAlarm.addListener(async () => {
    const state = await getTimerState();
    updateBadge(state);
  });

  // Restore badge after service worker restarts
  getTimerState().then(updateBadge);

  chrome.runtime.onMessage.addListener((message: ExtMessage, _sender, sendResponse) => {
    handleMessage(message)
      .then(sendResponse)
      .catch((err: Error) => sendResponse({ ok: false, error: err.message }));
    return true; // Keep the message channel open for async response
  });
});
