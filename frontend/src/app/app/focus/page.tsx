'use client';

import { useState, useMemo, useEffect, useLayoutEffect, useRef, startTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import TagManagementModal from '@/components/TagManagementModal';
import LogSessionDrawer from '@/features/focus/components/LogSessionDrawer';
import { useTagsQuery } from '@/hooks/useTags';
import { useTimer } from '@/contexts/TimerContext';
import { useFocusTimer } from '@/features/focus/hooks/useFocusTimer';
import TagSelector from '@/features/focus/components/TagSelector';
import TimerDisplay from '@/features/focus/components/TimerDisplay';
import TimerControls from '@/features/focus/components/TimerControls';
import FocusFooter from '@/features/focus/components/FocusFooter';
import { formatElapsedTime } from '@/utils/dateUtils';
import { useInvalidateAnalytics } from '@/features/analytics/hooks/useInvalidateAnalytics';
import { trackTimerEvent } from '@/utils/analytics/timerEvents';

export default function FocusPage() {
  const [userSelectedTag, setUserSelectedTag] = useState<string | null>(null);
  const [isTagManagementOpen, setIsTagManagementOpen] = useState(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [workTitle, setWorkTitle] = useState<string>('');
  const [workNotes, setWorkNotes] = useState<string>('');

  const { data: tags = [], isLoading: tagsLoading } = useTagsQuery();
  const searchParams = useSearchParams();
  const { invalidateAll } = useInvalidateAnalytics();

  // Pre-fill from query parameters on mount
  useLayoutEffect(() => {
    const tagParam = searchParams.get('tag');
    const titleParam = searchParams.get('title');
    const notesParam = searchParams.get('notes');

    // Wrap state updates in startTransition to avoid cascading renders
    startTransition(() => {
      // Set tag if provided and exists in tags list
      if (tagParam && tags.some(t => t.name === tagParam)) {
        setUserSelectedTag(tagParam);
      }

      // Set title if provided
      if (titleParam) {
        setWorkTitle(titleParam);
      }

      // Set notes if provided
      if (notesParam) {
        setWorkNotes(notesParam);
      }
    });

    // Clean up URL after reading params (optional but good UX)
    if (tagParam || titleParam || notesParam) {
      // Use window.history.replaceState to clean URL without navigation
      window.history.replaceState({}, '', '/app/focus');
    }
  }, [searchParams, tags]);

  // Derive selected tag: use user selection if available, otherwise use first tag
  const selectedTag = useMemo(() => {
    if (userSelectedTag) {
      return userSelectedTag;
    }
    return tags.length > 0 ? tags[0].name : '';
  }, [userSelectedTag, tags]);
  
  // Get timer status setter from context
  const { setTimerStatus } = useTimer();

  const {
    elapsedSeconds,
    isRunning,
    isPaused,
    isSaving,
    saveError,
    start,
    pause,
    finish,
  } = useFocusTimer(setTimerStatus);

  // Store original document title
  const originalTitleRef = useRef<string | null>(null);

  // Update document title based on timer state
  useEffect(() => {
    // Store original title on mount
    if (originalTitleRef.current === null) {
      originalTitleRef.current = document.title;
    }

    // Update title based on timer state
    if (isRunning && !isPaused) {
      // Timer is running
      const formattedTime = formatElapsedTime(elapsedSeconds);
      document.title = `${formattedTime} - Focus Timer`;
    } else if (isPaused) {
      // Timer is paused
      const formattedTime = formatElapsedTime(elapsedSeconds);
      document.title = `${formattedTime} - Focus Timer`;
    } else {
      // Timer is stopped - restore original title
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    }

    // Cleanup: restore original title on unmount
    return () => {
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    };
  }, [elapsedSeconds, isRunning, isPaused]);

  // Warn user before closing/refreshing browser when timer is running
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning && !isPaused) {
        // Modern browsers ignore custom messages and show their own
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
        return ''; // Required for some browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRunning, isPaused]);

  // Handle finish with tag information
  const handleFinish = () => {
    const selectedTagObj = tags.find(t => t.name === selectedTag);
    const tagId = selectedTagObj?.id || null;
    // Optimistic update: reset metadata immediately, send to backend (fire and forget)
    // Invalidate cache AFTER backend successfully saves the block
    finish(tagId, selectedTag, workTitle, workNotes, () => {
      invalidateAll(); // Only invalidate after API succeeds
    });
    setWorkTitle('');
    setWorkNotes('');
  };

  // Handle log session save
  const handleLogSave = (work: string, notes: string) => {
    setWorkTitle(work);
    setWorkNotes(notes);
  };

  return (
    <div className="flex-1 h-full bg-background flex flex-col items-center justify-between text-foreground overflow-hidden relative">
        {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center justify-center relative gap-12">
        {/* Tag Selector */}
        <TagSelector
          selectedTag={selectedTag}
          tags={tags}
          isLoading={tagsLoading}
          onTagSelect={(tag) => {
            setUserSelectedTag(tag);
            trackTimerEvent.tagSelected(tag);
          }}
          onManageTags={() => {
            setIsTagManagementOpen(true);
            trackTimerEvent.tagManagementOpened();
          }}
        />

        {/* Timer Display */}
        <TimerDisplay
          elapsedSeconds={elapsedSeconds}
          isRunning={isRunning}
          isPaused={isPaused}
        />

        {/* Timer Controls */}
        <TimerControls
          isRunning={isRunning}
          isPaused={isPaused}
          isSaving={isSaving}
          saveError={saveError}
          onStart={() => start(selectedTag)}
          onPause={pause}
          onFinish={handleFinish}
        />
      </main>

      {/* Tag Management Modal */}
      <TagManagementModal
        isOpen={isTagManagementOpen}
        onClose={() => {
          setIsTagManagementOpen(false);
        }}
        tags={tags.map(t => t.name)}
        setTags={() => {
          // This is called by TagManagementModal but we manage tags ourselves
          // The modal will reload tags when it opens, so we don't need to update here
        }}
        selectedTag={selectedTag}
        setSelectedTag={(tag) => setUserSelectedTag(tag)}
      />

      {/* Log Session Drawer */}
      {isLogDrawerOpen && (
        <LogSessionDrawer
          isOpen={isLogDrawerOpen}
          onClose={() => setIsLogDrawerOpen(false)}
          onSave={handleLogSave}
          initialWork={workTitle}
          initialNotes={workNotes}
        />
      )}

      {/* Footer */}
      <FocusFooter
        onLogClick={() => {
          setIsLogDrawerOpen(true);
          trackTimerEvent.logDrawerOpened();
        }}
      />
    </div>
  );
}
