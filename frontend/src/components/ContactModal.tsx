'use client';

import { useEffect, useRef } from 'react';
import { X, Mail } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({
  isOpen,
  onClose,
}: ContactModalProps) {
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={(e) => {
        // Close modal when clicking on backdrop
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
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E4E2DD]">
          <h2 className="text-lg font-semibold text-[#1B1B1B]">Contact Us</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-black/5 rounded-md transition-colors text-[#6D6D6D] hover:text-[#1B1B1B]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Introductory Text */}
          <p className="text-sm text-[#1B1B1B] leading-6">
            We&apos;re here to help you stay focused and productive. The fastest way to reach us is through email.
          </p>

          {/* Email Contact Section */}
          <div className="flex items-start gap-3 p-4 bg-[#F7F6F3] border border-[#E4E2DD] rounded-lg">
            <Mail className="w-5 h-5 text-[#1B1B1B] shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="flex flex-col gap-1">
              <span className="text-sm text-[#1B1B1B]">Email us at:</span>
              <a 
                href="mailto:hello@hourbloc.com"
                className="text-sm font-medium text-[#3cbf6f] hover:text-[#33ad64] transition-colors"
              >
                hello@hourbloc.com
              </a>
            </div>
          </div>

          {/* Response Time Information */}
          <p className="text-sm text-[#1B1B1B]/70 leading-6">
            We typically respond within 24 hours during business days.
          </p>
        </div>
      </div>
    </div>
  );
}
