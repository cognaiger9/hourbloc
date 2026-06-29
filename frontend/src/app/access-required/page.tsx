'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/utils/api/client';

export default function AccessRequiredPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await apiRequest('/api/v1/access/redeem', {
        method: 'POST',
        body: JSON.stringify({ invite_code: code }),
      });
      router.push('/app');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      if (msg.toLowerCase().includes('401') || msg.toLowerCase().includes('credentials')) {
        setError('You must be logged in first.');
      } else if (msg.toLowerCase().includes('invalid')) {
        setError('Invalid invite code. Please try again.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <main className="w-full max-w-[500px] flex flex-col items-center">
        <h1 className="text-4xl font-medium tracking-tighter text-center text-foreground mb-12 flex items-center justify-center gap-1.5">
          <div className="w-11 h-11 flex items-center justify-center">
            <Image
              src="/logo-trans.png"
              alt="hourbloc logo"
              width={44}
              height={44}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          hourbloc
        </h1>

        <h2 className="text-xl font-normal text-center text-foreground leading-snug mb-3 px-4">
          Access restricted
        </h2>

        <p className="text-sm font-light text-center text-foreground-secondary leading-relaxed mb-10 max-w-[340px]">
          Enter your invite code to unlock access.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Invite code"
            disabled={isLoading}
            className="w-full h-12 px-4 bg-surface border border-[#E5E5E5] rounded-md text-sm font-normal text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200 disabled:opacity-50"
          />

          {error && (
            <div className="w-full p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="w-full h-12 bg-surface border border-[#E5E5E5] rounded-md flex items-center justify-center hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm font-normal text-foreground">
              {isLoading ? 'Verifying...' : 'Unlock access'}
            </span>
          </button>
        </form>

        <div className="mt-6 text-xs font-light text-gray-500">
          <Link href="/login" className="text-foreground hover:underline underline-offset-2 transition-colors">
            Back to login
          </Link>
        </div>
      </main>
    </div>
  );
}
