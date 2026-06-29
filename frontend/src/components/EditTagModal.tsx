'use client';

import { useEffect, useRef, useState } from 'react';
import { TAG_COLORS } from '@/utils/tagColors';

type ErrorType = 'validation' | 'api-error' | null;

interface EditTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tagName: string;
  tagColor: string;
  onSave: (name: string, color: string) => void;
  mode?: 'edit' | 'add';
  error?: string | null;
  errorType?: ErrorType;
}

export default function EditTagModal({
  isOpen,
  onClose,
  tagName,
  tagColor,
  onSave,
  mode = 'edit',
  error = null,
  errorType = null,
}: EditTagModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(tagName);
  const [selectedColor, setSelectedColor] = useState(tagColor);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        event.stopPropagation(); // Prevent event from bubbling to parent modal
        onClose();
      }
    };

    if (isOpen) {
      // Use capture phase to handle before parent modal
      document.addEventListener('mousedown', handleClickOutside, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isOpen, onClose]);

  const handleSave = async () => {
    if (name.trim()) {
      await onSave(name.trim(), selectedColor);
      // Don't call onClose here - let the parent component handle closing
      // This allows errors (like tag limit) to be displayed properly
    }
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent event from bubbling to parent modal
    }
    setName(tagName);
    setSelectedColor(tagColor);
    onClose();
  };

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
        className="w-full max-w-[446px] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from bubbling
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E4E2DD]">
          <h2 className="text-[#1B1B1B] text-lg font-medium tracking-tight leading-[28px]">
            {mode === 'add' ? 'Add Tag' : 'Edit Tag'}
          </h2>
        </div>

        {/* Error Section */}
        {error && (errorType === 'validation' || errorType === 'api-error') && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Input Group */}
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-[0.05em] text-[#1B1B1B]/50">
              Tag Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Project X"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  } else if (e.key === 'Escape') {
                    handleCancel();
                  }
                }}
                className="w-full px-3 py-[10px] text-sm font-light text-[#1B1B1B] placeholder-[#1B1B1B]/30 bg-white border border-[#E4E2DD] rounded-lg focus:outline-none focus:border-[#3CBF6F] focus:ring-1 focus:ring-[#3CBF6F] transition-all duration-200 ease-in-out"
                autoFocus
              />
            </div>
          </div>

          {/* Color Group */}
          <div className="space-y-3">
            <label className="block text-xs font-medium uppercase tracking-[0.05em] text-[#1B1B1B]/50">
              Color
            </label>
            <div className="flex flex-wrap items-center gap-[18px]">
              {TAG_COLORS.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none hover:shadow-md"
                    style={{
                      backgroundColor: color,
                      boxShadow: isSelected ? `0 0 0 2px #ffffff, 0 0 0 4px ${color}` : undefined,
                    }}
                    aria-label={`Select ${color}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-6 border-t border-[#E4E2DD] bg-white flex justify-end items-center gap-3">
          <button
            onClick={(e) => handleCancel(e)}
            className="px-4 py-2 text-sm font-normal text-[#1B1B1B]/70 hover:text-[#1B1B1B] transition-colors duration-200 focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={false}
            className="px-4 py-2 bg-[#3CBF6F] text-white text-sm font-normal rounded-lg shadow-[0_1px_2px_rgba(60,191,111,0.2)] hover:bg-[#34A861] transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#3CBF6F] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#3CBF6F]"
          >
            {mode === 'add' ? 'Add Tag' : 'Save Tag'}
          </button>
        </div>
      </div>
    </div>
  );
}

