'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export function useGoogleLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setLoginError(null);

      const supabase = createClient();

      // Get redirect parameter if exists
      const redirectTo = searchParams.get('redirect') || '/app';

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth?redirect=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (oauthError) {
        setLoginError(oauthError.message || 'Failed to initiate Google login');
        setIsLoading(false);
      }
      // If successful, the user will be redirected to Google OAuth
      // so we don't need to set loading to false here
    } catch {
      setLoginError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return {
    handleGoogleLogin,
    isLoading,
    loginError,
    setLoginError,
  };
}

