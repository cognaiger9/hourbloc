'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Calendar } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { text: string; description?: string }) => Promise<void>;
  onDelete?: () => Promise<void>;
  onMoveToToday?: () => Promise<void>;
  mode?: 'create' | 'edit';
  initialTask?: { text: string; description?: string };
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  onMoveToToday,
  mode = 'create',
  initialTask,
}: CreateTaskModalProps) {
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialTask) {
        setText(initialTask.text);
        setDescription(initialTask.description || '');
      } else {
        setText('');
        setDescription('');
      }
      setValidationError(null);
      setIsSaving(false);
      setIsDeleting(false);
      setIsMoving(false);
    }
  }, [isOpen, mode, initialTask]);

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
    if (!text.trim()) {
      setValidationError('Task text is required');
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    // Close modal immediately for instant feedback
    onClose();

    try {
      await onSave({
        text: text.trim(),
        description: description.trim() || undefined,
      });
    } catch (error) {
      console.error('Failed to save task:', error);
      // Error handling is done via optimistic updates rollback
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);

    // Close modal immediately for instant feedback
    onClose();

    try {
      await onDelete();
    } catch (error) {
      console.error('Failed to delete task:', error);
      // Error handling is done via optimistic updates rollback
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMoveToToday = async () => {
    if (!onMoveToToday) return;

    setIsMoving(true);

    // Close modal immediately for instant feedback
    onClose();

    try {
      await onMoveToToday();
    } catch (error) {
      console.error('Failed to move task to today:', error);
      // Error handling is done via optimistic updates rollback
    } finally {
      setIsMoving(false);
    }
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
              {mode === 'edit' ? 'Edit Task' : 'Add Task'}
            </h2>
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
          {/* Text Input */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.05em] text-[#1B1B1B]/50 mb-2">
              Task
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Review Q4 Marketing Strategy"
              className="w-full px-3 py-2 text-sm text-[#1B1B1B] bg-white border border-[#E4E2DD] rounded-lg focus:outline-none focus:border-[#3CBF6F] focus:ring-1 focus:ring-[#3CBF6F] transition-all"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                }
              }}
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
          {/* Left side buttons - Only show in edit mode */}
          {mode === 'edit' ? (
            <div className="flex items-center gap-3">
              {onMoveToToday && (
                <button
                  onClick={handleMoveToToday}
                  className="px-4 py-2 text-sm font-medium text-[#6d6d6d] bg-white border border-[#d0d0d0] hover:border-[#9e9e9e] hover:text-[#1b1b1b] rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#d0d0d0] focus:ring-offset-2 flex items-center gap-2"
                  disabled={isMoving || isSaving || isDeleting}
                >
                  <Calendar className="w-4 h-4" strokeWidth={1.5} />
                  {isMoving ? 'Moving...' : 'Move to Today'}
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#E86858] hover:bg-[#D65A4B] rounded-lg shadow-[0_1px_2px_rgba(232,104,88,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#E86858] focus:ring-offset-2"
                  disabled={isDeleting || isSaving || isMoving}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#3CBF6F] text-white text-sm font-medium rounded-lg shadow-[0_1px_2px_rgba(60,191,111,0.2)] hover:bg-[#34A861] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#3CBF6F]"
              disabled={isSaving || isDeleting || isMoving}
            >
              {isSaving
                ? mode === 'edit'
                  ? 'Updating...'
                  : 'Adding...'
                : mode === 'edit'
                  ? 'Update Task'
                  : 'Add Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
