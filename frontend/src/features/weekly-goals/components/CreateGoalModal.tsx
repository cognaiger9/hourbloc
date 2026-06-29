'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description?: string }) => void;
  onDelete?: () => void;
  weekStart: Date;
  mode?: 'create' | 'edit';
  initialGoal?: { title: string; description?: string };
}

export default function CreateGoalModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  weekStart,
  mode = 'create',
  initialGoal,
}: CreateGoalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialGoal) {
        setTitle(initialGoal.title);
        setDescription(initialGoal.description || '');
      } else {
        setTitle('');
        setDescription('');
      }
      setValidationError(null);
    }
  }, [isOpen, mode, initialGoal]);

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

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setValidationError('Title is required');
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    // Call onSave without waiting - parent handles optimistic update and closes modal immediately
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
    });
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    onClose();
  };

  const handleDelete = () => {
    if (!onDelete) return;

    // Call onDelete without waiting - parent handles optimistic update and closes modal immediately
    onDelete();
  };

  const formatWeekRange = (weekStart: Date): string => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
    const startDay = weekStart.getDate();
    const endDay = weekEnd.getDate();
    const year = weekStart.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} – ${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
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
        className="w-full max-w-[500px] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E4E2DD]">
          <div>
            <h2 className="text-lg font-semibold text-[#1B1B1B]">
              {mode === 'edit' ? 'Edit Weekly Goal' : 'Add Weekly Goal'}
            </h2>
            <p className="text-xs text-[#6D6D6D] mt-0.5">for {formatWeekRange(weekStart)}</p>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 hover:bg-black/5 rounded-md transition-colors text-[#6D6D6D] hover:text-[#1B1B1B]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.05em] text-[#1B1B1B]/50 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Launch landing page"
              className="w-full px-3 py-2 text-sm text-[#1B1B1B] bg-white border border-[#E4E2DD] rounded-lg focus:outline-none focus:border-[#3CBF6F] focus:ring-1 focus:ring-[#3CBF6F] transition-all"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.05em] text-[#1B1B1B]/50 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details..."
              rows={4}
              className="w-full px-3 py-2 text-sm text-[#1B1B1B] bg-white border border-[#E4E2DD] rounded-lg focus:outline-none focus:border-[#3CBF6F] focus:ring-1 focus:ring-[#3CBF6F] resize-none transition-all"
            />
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="px-3 py-2 bg-[#FEE2E2] border border-[#FCA5A5] rounded-lg">
              <p className="text-xs text-[#DC2626]">{validationError}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-6 border-t border-[#E4E2DD] bg-white flex justify-between items-center gap-3">
          {/* Delete Button - Only show in edit mode */}
          {mode === 'edit' && onDelete ? (
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-[#E86858] hover:bg-[#D65A4B] rounded-lg shadow-[0_1px_2px_rgba(232,104,88,0.2)] transition-all focus:outline-none focus:ring-2 focus:ring-[#E86858] focus:ring-offset-2"
            >
              Delete
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-[#1B1B1B]/70 hover:text-[#1B1B1B] transition-colors rounded-lg focus:outline-none"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#3CBF6F] text-white text-sm font-medium rounded-lg shadow-[0_1px_2px_rgba(60,191,111,0.2)] hover:bg-[#34A861] transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#3CBF6F]"
            >
              {mode === 'edit' ? 'Update Goal' : 'Add Goal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
