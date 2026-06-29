'use client';

import { useRef, useEffect } from 'react';

interface DeleteBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteBlockModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteBlockModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        event.stopPropagation();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isOpen, onClose]);

  const handleConfirm = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    onConfirm();
    onClose();
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-[446px] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center px-6 py-5 border-b border-[#E4E2DD]">
          <h2 className="text-lg font-semibold text-[#E86858]">Delete Block?</h2>
        </div>

        {/* Body */}
        <div className="flex flex-col items-center px-6 py-8">
          {/* Icon Wrapper */}
          <div className="w-12 h-12 rounded-full bg-[#E86858]/10 flex items-center justify-center text-[#E86858] mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </div>

          {/* Description Text */}
          <p className="text-sm text-[#1B1B1B]/70 text-center leading-7 mb-6 max-w-sm">
            Deleting this time block will permanently remove it. This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-6 border-t border-[#E4E2DD] bg-white">
          <button
            onClick={(e) => handleCancel(e)}
            className="px-4 py-2 text-sm font-medium text-[#1B1B1B]/70 hover:text-[#1B1B1B] transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E4E2DD]"
          >
            Cancel
          </button>
          <button
            onClick={(e) => handleConfirm(e)}
            className="px-4 py-2 text-sm font-medium text-white bg-[#E86858] hover:bg-[#D65A4B] rounded-lg shadow-[0_1px_2px_rgba(232,104,88,0.2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[#E86858] focus:ring-offset-2"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

