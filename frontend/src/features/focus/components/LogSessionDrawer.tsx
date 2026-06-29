'use client';

import { useState, useEffect, useRef } from 'react';

interface LogSessionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (work: string, notes: string) => void;
  initialWork?: string;
  initialNotes?: string;
}

export default function LogSessionDrawer({
  isOpen,
  onClose,
  onSave,
  initialWork = '',
  initialNotes = '',
}: LogSessionDrawerProps) {
  const [work, setWork] = useState('');
  const [notes, setNotes] = useState('');
  const drawerRef = useRef<HTMLDivElement>(null);

  // Initialize with values when drawer opens
  useEffect(() => {
    if (isOpen) {
      setWork(initialWork);
      setNotes(initialNotes);
    }
  }, [isOpen, initialWork, initialNotes]);

  // Close drawer when clicking outside (on overlay)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSave = () => {
    if (onSave) {
      onSave(work, notes);
    }
    onClose();
  };

  const handleCancel = () => {
    setWork('');
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay/Backdrop */}
      <div className="fixed inset-0 bg-black/5 pointer-events-auto z-40" />

      {/* Drawer Component */}
      <aside
        ref={drawerRef}
        className="fixed right-0 top-0 w-full sm:w-[420px] h-full bg-white shadow-[-24px_0_24px_rgba(0,0,0,0.08)] flex flex-col z-50"
      >
        {/* Header */}
        <header className="h-[64px] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-[20px] font-medium leading-[30px] tracking-[-0.5px] text-[#1B1B1B]">
            Log Session
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-black/5 transition-colors text-[#6D6D6D]"
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        {/* Divider */}
        <div className="h-[1px] w-full bg-[#E4E2DD] flex-shrink-0"></div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Input Group 1 */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="work"
              className="text-[14px] font-medium leading-[21px] text-[#1B1B1B]"
            >
              What did you work on?
            </label>
            <div className="relative group">
              <input
                type="text"
                id="work"
                value={work}
                onChange={(e) => setWork(e.target.value)}
                data-private
                className="w-full h-[44px] px-4 rounded-[6px] bg-[#F7F6F3] border border-[#E4E2DD] text-[16px] text-[#1B1B1B] placeholder-[#9E9E9E] outline-none focus:border-[#D1CFC9] transition-all"
                placeholder="e.g., Client proposal, Code refactor, Email responses"
              />
            </div>
          </div>

          {/* Input Group 2 */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="notes"
              className="text-[14px] font-medium leading-[21px] text-[#1B1B1B]"
            >
              Notes (optional)
            </label>
            <div className="relative group">
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                data-private
                className="w-full min-h-[120px] p-4 rounded-[6px] bg-[#F7F6F3] border border-[#E4E2DD] text-[16px] leading-[26px] text-[#1B1B1B] placeholder-[#9E9E9E] outline-none focus:border-[#D1CFC9] transition-all resize-y"
                placeholder="Key details, blockers, outcomes..."
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="p-6 border-t border-[#E4E2DD] flex items-center gap-2 bg-white flex-shrink-0">
          {/* Cancel Button */}
          <button
            onClick={handleCancel}
            className="flex-1 h-[48px] rounded-full bg-[#EEEDE8] hover:bg-[#E5E4DE] active:scale-[0.98] text-[#1B1B1B] text-[16px] font-medium flex items-center justify-center transition-all duration-200 outline-none"
          >
            Cancel
          </button>

          {/* Save Log Button */}
          <button
            onClick={handleSave}
            className="flex-1 h-[48px] rounded-full bg-accent-green hover:bg-green-hover active:scale-[0.98] text-white text-[16px] font-medium flex items-center justify-center shadow-sm shadow-accent-green/10 transition-all duration-200 outline-none"
          >
            Save Log
          </button>
        </footer>
      </aside>
    </>
  );
}

