'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { Settings, Camera } from 'lucide-react';
import { cn } from '@/utils/common';

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    // Redirect will be handled by AppLayoutInner based on explicit_logout flag
  };

  const handleSettings = () => {
    // TODO: Navigate to settings page when implemented
    console.log('Settings clicked');
  };

  return (
    <div className="bg-background min-h-screen flex flex-col text-foreground">
      {/* Header */}
      <header className="flex w-full pt-6 pr-6 pb-6 pl-6 items-center justify-between">
        <div className="select-none">
          <span className="text-base font-medium tracking-tight text-foreground">
            HourBloc
          </span>
        </div>
        <button
          onClick={handleSettings}
          className="text-foreground-secondary hover:text-foreground transition-colors"
        >
          <Settings width={24} height={24} strokeWidth={1.5} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full max-w-md mx-auto pt-12 px-6 items-center">
        {/* Profile Section */}
        <div className="flex flex-col items-center mb-10 w-full">
          <div className="relative group cursor-default">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 border border-white/20 shadow-sm mb-4 relative overflow-hidden">
              {user?.user_metadata?.avatar_url ? (
                <Image
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.full_name || 'User'}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-white/10" />
              )}
            </div>
            {/* Edit Badge */}
            <div className="absolute bottom-4 -right-1 bg-background border border-border rounded-full p-1.5 shadow-sm flex items-center justify-center text-foreground">
              <Camera width={14} height={14} strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-2xl font-medium text-foreground tracking-tight text-center">
            {user?.user_metadata?.full_name || 'User'}
          </h1>
          <p className="text-sm text-foreground-secondary mt-1 font-normal tracking-normal text-center">
            {user?.email || ''}
          </p>

        </div>

        {/* Action Section */}
        <div className="w-full space-y-4">
          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className={cn(
              'w-full bg-background border border-border hover:bg-black/5 hover:border-border text-foreground text-sm font-medium py-3.5 px-6 rounded-lg transition-all duration-200 ease-in-out',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
            disabled={isLoading}
          >
            {isLoading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>

        {/* Stats / Info Section (placeholder for future enhancements) */}
        <div className="mt-12 w-full grid grid-cols-2 gap-4">
          {/* Future stats like total hours tracked, tasks completed, etc. */}
        </div>
      </main>
    </div>
  );
}
