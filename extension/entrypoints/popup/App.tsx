import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../src/lib/supabase';
import { LoginView } from './components/LoginView';
import { TimerView } from './components/TimerView';
import type { TimerState } from '../../src/types';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authPending, setAuthPending] = useState(false);
  const [timerState, setTimerState] = useState<TimerState | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.auth.getSession(),
      chrome.storage.local.get('authPending'),
    ]).then(([{ data: { session } }, stored]) => {
      setSession(session);
      setAuthPending(!!stored.authPending);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // When the background clears authPending, refresh the session to pick up the new auth state.
    const storageListener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (!('authPending' in changes)) return;
      const pending = !!changes.authPending.newValue;
      setAuthPending(pending);
      if (!pending) {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
      }
    };
    chrome.storage.onChanged.addListener(storageListener);

    return () => {
      subscription.unsubscribe();
      chrome.storage.onChanged.removeListener(storageListener);
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    chrome.runtime.sendMessage({ type: 'GET_STATE' }, (res) => {
      if (res?.ok) setTimerState(res.state as TimerState);
    });
  }, [session]);

  if (loading || authPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 w-full min-h-[200px]">
        <div className="w-5 h-5 border-2 border-[#3cbf6f] border-t-transparent rounded-full animate-spin" />
        {authPending && <p className="text-sm text-[#6d6d6d]">Signing you in...</p>}
      </div>
    );
  }

  if (!session) {
    return <LoginView onLogin={setSession} />;
  }

  return (
    <TimerView
      session={session}
      timerState={timerState}
      onTimerStateChange={setTimerState}
      onLogout={async () => {
        await supabase.auth.signOut();
        setSession(null);
        setTimerState(null);
      }}
    />
  );
}
