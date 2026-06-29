'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
} from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { getSystemTimezone } from '@/utils/timezoneUtils';
import posthog from 'posthog-js';
import { trackActivationMilestone } from '@/utils/analytics/activationEvents';
import { useQueryClient } from '@tanstack/react-query';

interface UserContextType {
  user: User | null;
  timezone: string;
  isLoading: boolean;
  error: string | null;
  updateTimezone: (timezone: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_TIMEZONE = 'UTC';

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [timezone, setTimezone] = useState<string>(DEFAULT_TIMEZONE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const response = await supabase.auth.getUser();

      const currentUser = response?.data?.user;
      const userError = response?.error;

      if (userError) {
        throw userError;
      }

      if (currentUser) {
        setUser(currentUser);

        const userTimezone = currentUser.user_metadata?.timezone;

        let finalTimezone = userTimezone;

        if (userTimezone) {
          setTimezone(userTimezone);
        } else {
          try {
            const detectedTimezone = getSystemTimezone();
            setTimezone(detectedTimezone);
            finalTimezone = detectedTimezone;

            await supabase.auth.updateUser({
              data: { timezone: detectedTimezone },
            });
          } catch (updateError) {
            console.error('[UserContext] Failed to save timezone to user metadata:', updateError);
            const fallbackTimezone = 'UTC';
            setTimezone(fallbackTimezone);
            finalTimezone = fallbackTimezone;
          }
        }

        if (typeof window !== 'undefined') {
          posthog.identify(currentUser.id, {
            email: currentUser.email,
            name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0],
            timezone: finalTimezone || DEFAULT_TIMEZONE,
            created_at: currentUser.created_at,
          });

          posthog.register({
            user_timezone: finalTimezone || DEFAULT_TIMEZONE,
          });

          const userCreatedAt = new Date(currentUser.created_at).getTime();
          const now = Date.now();
          const isNewSignup = (now - userCreatedAt) < 10000;

          if (isNewSignup) {
            trackActivationMilestone.signup('google');
          }
        }
      } else {
        setUser(null);
        setTimezone(DEFAULT_TIMEZONE);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user';
      setError(errorMessage);
      setUser(null);
      setTimezone(DEFAULT_TIMEZONE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const userId = user?.id;
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (typeof window !== 'undefined') {
          posthog.reset();
          console.log('[UserContext] PostHog user reset');
        }
        setUser(null);
        setTimezone(DEFAULT_TIMEZONE);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN') {
        if (!userId || userId !== session.user.id) {
          loadUser();
        } else {
          console.log('[UserContext] Same user already loaded, skipping reload');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUser, userId]);

  const updateTimezone = useCallback(async (newTimezone: string) => {
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        data: { timezone: newTimezone },
      });

      if (updateError) {
        throw updateError;
      }

      setTimezone(newTimezone);

      const {
        data: { user: updatedUser },
      } = await supabase.auth.getUser();
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update timezone';
      setError(errorMessage);
      console.error('Error updating timezone:', err);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('explicit_logout', 'true');
      }

      const supabase = createClient();
      await supabase.auth.signOut();

      queryClient.clear();
    } catch (err) {
      console.error('[UserContext] Error signing out:', err);
      throw err;
    }
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      timezone,
      isLoading,
      error,
      updateTimezone,
      signOut,
    }),
    [
      user,
      timezone,
      isLoading,
      error,
      updateTimezone,
      signOut,
    ]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
