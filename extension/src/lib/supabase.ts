import { createClient } from '@supabase/supabase-js';
import type { SupportedStorage } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Async chrome.storage.local adapter - required because service workers have no localStorage.
// Both the popup and the background service worker share the same underlying storage,
// so the session written by the popup is readable by the background on STOP_TIMER.
const chromeStorageAdapter: SupportedStorage = {
  getItem: async (key: string) => {
    const result = await chrome.storage.local.get(key);
    return (result[key] as string) ?? null;
  },
  setItem: async (key: string, value: string) => {
    await chrome.storage.local.set({ [key]: value });
  },
  removeItem: async (key: string) => {
    await chrome.storage.local.remove(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: chromeStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
