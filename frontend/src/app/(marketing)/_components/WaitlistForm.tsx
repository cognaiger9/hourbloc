'use client';

import { useState } from 'react';
import posthog from 'posthog-js';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your email');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setStatus('success');
      setEmail('');

      // Track waitlist signup
      const emailDomain = email.split('@')[1];
      posthog.capture('waitlist_signup', {
        email_domain: emailDomain, // Track domain but not full email for privacy
        signup_source: 'landing_page',
      });
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to connect. Please try again later.');
    }
  };

  return (
    <>
      <form 
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4"
      >
        <input 
          type="email" 
          placeholder="Enter your email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading' || status === 'success'}
          className="flex-1 px-4 py-3 rounded-lg border border-border bg-surface text-sm placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button 
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="bg-accent-green text-white font-medium px-6 py-3 rounded-lg hover:bg-green-hover transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Joining...' : status === 'success' ? 'Joined!' : 'Join waitlist'}
        </button>
      </form>
      
      {status === 'success' && (
        <p className="text-sm text-accent-green mb-4">
          ✓ Thanks! We&apos;ll notify you when we launch.
        </p>
      )}
      
      {status === 'error' && errorMessage && (
        <p className="text-sm text-danger mb-4">
          {errorMessage}
        </p>
      )}
      
      {status !== 'success' && (
        <p className="text-xs text-foreground-secondary">No spam, ever. We&apos;ll notify you when we launch.</p>
      )}
    </>
  );
}
