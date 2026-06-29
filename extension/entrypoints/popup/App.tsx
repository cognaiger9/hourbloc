import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../src/lib/supabase';
import { LoginView } from './components/LoginView';
import { TimerView } from './components/TimerView';
import type { TimerState } from '../../src/types';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [timerState, setTimerState] = useState<TimerState | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    chrome.runtime.sendMessage({ type: 'GET_STATE' }, (res) => {
      if (res?.ok) setTimerState(res.state as TimerState);
    });
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[200px]">
        <div className="w-5 h-5 border-2 border-[#3cbf6f] border-t-transparent rounded-full animate-spin" />
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
