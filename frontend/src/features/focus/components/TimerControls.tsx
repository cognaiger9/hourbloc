'use client';

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  isSaving: boolean;
  saveError: string | null;
  onStart: () => void;
  onPause: () => void;
  onFinish: () => void;
}

export default function TimerControls({
  isRunning,
  isPaused,
  isSaving,
  saveError,
  onStart,
  onPause,
  onFinish,
}: TimerControlsProps) {
  return (
    <div className="mt-12 flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        {!isRunning ? (
          /* Start Focus Session Button */
          <button 
            onClick={onStart}
            className="group flex items-center justify-center gap-2 bg-accent-green hover:bg-green-hover active:scale-[0.98] w-[200px] h-[48px] rounded-full transition-all duration-200 shadow-sm shadow-accent-green/10"
          >
            <span className="text-sm font-medium text-white">Start Focus Session</span>
          </button>
        ) : (
          <>
            {/* Finish Button */}
            <button 
              onClick={onFinish}
              disabled={isSaving}
              className="group flex items-center justify-center gap-2 bg-accent-green hover:bg-green-hover active:scale-[0.98] w-[128px] h-[48px] rounded-full transition-all duration-200 shadow-sm shadow-accent-green/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm font-medium text-white">
                {isSaving ? 'Saving...' : 'Finish'}
              </span>
              {!isSaving && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </button>

            {/* Pause/Resume Button */}
            <button 
              onClick={onPause}
              disabled={isSaving}
              className="flex items-center justify-center w-[65px] h-[48px] bg-white hover:bg-gray-50 active:scale-[0.98] border border-[#E5E7EB] rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPaused ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="translate-x-[0.5px]">
                  <line x1="10" y1="4" x2="10" y2="20"></line>
                  <line x1="14" y1="4" x2="14" y2="20"></line>
                </svg>
              )}
            </button>
          </>
        )}
      </div>
      
      {/* Error Message */}
      {saveError && (
        <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg max-w-md">
          <p className="text-sm text-red-800 text-center">{saveError}</p>
        </div>
      )}
    </div>
  );
}

